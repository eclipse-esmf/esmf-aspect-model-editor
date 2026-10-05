/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {
  FileEntry,
  FileInformation,
  LoadedFilesService,
  ModelApiPort,
  ModelDocumentService,
  ModelInstantiatorPort,
  ModelLoaderPort,
  NamespaceFile,
  RdfModelUtil,
} from '@ame/domain';
import {
  BrowserService,
  config,
  isVersionOutdated,
  LanguageTranslationService,
  NotificationsService,
  TauriSignalsService,
  TitleService,
} from '@ame/shared';
import {DestroyRef, inject, Injectable} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DefaultAspect, loadAspectModel, ModelElementCache, NamedElement, RdfLoader, RdfModel} from '@esmf/aspect-model-loader';
import {NamedNode} from 'n3';
import {catchError, combineLatest, concatMap, first, from, map, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {ModelRendererService} from './model-renderer.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {LoadModelPayload} from './models/load-model-payload.interface';
import {LoadingCodeErrors} from './models/loading-errors';
import {TabStateService} from './tabs/tab-state.service';

interface TmpLoadedFiles {
  files: LoadedFilesService['files'];
  currentLoadedFile: LoadedFilesService['currentLoadedFile'];
  filesAsList: LoadedFilesService['filesAsList'];
  externalFiles: LoadedFilesService['externalFiles'];
}

@Injectable({providedIn: 'root'})
export class ModelLoaderService implements ModelLoaderPort {
  private destroyRef = inject(DestroyRef);
  private loadedFilesService = inject(LoadedFilesService);
  private modelApiService = inject(ModelApiPort);
  private notificationsService = inject(NotificationsService);
  private instantiatorService = inject(ModelInstantiatorPort);
  private modelRenderer = inject(ModelRendererService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private browserService = inject(BrowserService);
  private tauriSignalsService = inject(TauriSignalsService);
  private titleService = inject(TitleService);
  private modelDocumentService = inject(ModelDocumentService);
  private translate = inject(LanguageTranslationService);

  private readonly tabStateService = inject(TabStateService);

  private tmpLoadedFiles: TmpLoadedFiles;

  /**
   * Loads a model with its dependencies and renders it
   */
  renderModel(payload: LoadModelPayload) {
    this.tmpLoadedFiles = {
      files: {...this.loadedFilesService.files},
      currentLoadedFile: this.loadedFilesService.currentLoadedFile,
      filesAsList: [...this.loadedFilesService.filesAsList],
      externalFiles: [...this.loadedFilesService.externalFiles],
    };
    this.loadedFilesService.removeAll();

    return this.loadSingleModel(payload, true).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(() => this.modelRenderer.renderModel(payload.editElementUrn)),
      tap(() => {
        this.modelSavingTracker.updateSavedModel();
        if (this.browserService.isStartedAsTauriApp()) {
          const currentFile = this.loadedFilesService.currentLoadedFile;
          this.tauriSignalsService.call('updateWindowInfo', {
            namespace: currentFile.namespace,
            fromWorkspace: payload.fromWorkspace,
            file: currentFile.name,
          });
        }
        if (!payload.isDefault) {
          this.notificationsService.info({title: 'Aspect Model loaded', timeout: 3000});
          this.titleService.updateTitle(this.loadedFilesService.currentLoadedFile?.absoluteName);
        }
        this.tabStateService.onModelLoaded(
          this.loadedFilesService.currentLoadedFile,
          payload.fromWorkspace,
          payload.editElementUrn,
          payload.replaceTabId,
        );
      }),
      tap(() => (this.loadedFilesService.currentLoadedFile.namespaceFiles = {})),
    );
  }

  /**
   * Loads a model into memory along with its dependencies and instantiates it (without rendering by default)
   * @param rdfContent
   * @param absoluteFileName
   */
  loadSingleModel(payload: LoadModelPayload, render = false) {
    const currentFileKey = payload.namespaceFileName || 'current';

    const migrate$ = this.parseRdfModel([{rdfAspectModel: payload.rdfAspectModel, sourceLocation: payload.aspectModelUri}]).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((rdfModel: RdfModel) =>
        isVersionOutdated(rdfModel.samm.version, config.currentSammVersion)
          ? this.migrateAspectModel(rdfModel.samm.version, payload.rdfAspectModel)
          : of(payload.rdfAspectModel),
      ),
    );

    return (render ? migrate$ : of(payload.rdfAspectModel)).pipe(
      takeUntilDestroyed(this.destroyRef),
      // getting dependencies from the current file and filter data from server
      switchMap((model: string) => {
        payload.rdfAspectModel = model;
        return this.modelApiService.loadNamespacesStructure();
      }),
      switchMap(() => this.getNamespaceDependencies(payload.rdfAspectModel, payload.aspectModelUri, {}, 0)),
      // loading in sequence all RdfModels for the current file and dependencies
      switchMap(files => this.loadRdfModelFromFiles(files, payload)),
      map(({files, rdfModels}) => {
        const remainingFiles = Object.fromEntries(Object.entries(files).filter(([key]) => key !== payload.namespaceFileName));
        return {files: remainingFiles, rdfModels};
      }),
      // loading the model with all namespace dependencies
      switchMap(({files, rdfModels}) =>
        loadAspectModel({
          filesContent: [payload.rdfAspectModel, ...Object.values(files)],
          aspectModelUrn: this.getAspectUrn(rdfModels[currentFileKey]),
        }).pipe(
          takeUntilDestroyed(this.destroyRef),
          // using switchMap to force this functionality to run before any tap after this
          switchMap(loadedFile => {
            if (!payload.aspectModelUrn) {
              payload.aspectModelUrn =
                this.getAspectUrn(loadedFile.rdfModel) || loadedFile.rdfModel.store.getSubjects(null, null, null)[0].value;
            }

            const mergedFile = {...loadedFile, rdfModel: rdfModels[currentFileKey]};
            // registering all loaded files
            const currentFile = this.registerFiles(rdfModels, mergedFile, payload, render);
            currentFile.namespaceFiles = files;
            // loading all isolated elements
            this.instantiatorService.instantiateRemainingElements(
              loadedFile.rdfModel,
              rdfModels[currentFileKey],
              loadedFile.cachedElements,
            );
            // filtering and registering the elements by their location in files
            this.moveElementsToTheirCacheFile(rdfModels, mergedFile, payload);
            // referenced elements without definition must neither be edited nor written into the current file
            const missingReferences = this.moveUnresolvedElements(rdfModels, rdfModels[currentFileKey], loadedFile.cachedElements);
            if (render) this.notifyMissingReferences(missingReferences);
            // remember which element stands at which position before the user can rename elements
            Object.values(rdfModels).forEach(rdfModel => this.modelDocumentService.bindElements(rdfModel));

            return of(
              render
                ? this.loadedFilesService.currentLoadedFile
                : this.loadedFilesService.getFile(currentFile?.absoluteName || payload.namespaceFileName),
            );
          }),
          catchError(error => {
            console.error(error);
            return throwError(() => ({code: LoadingCodeErrors.LOADING_ASPECT_MODEL, error}));
          }),
        ),
      ),
      catchError(error => {
        if (this.tmpLoadedFiles?.files) {
          this.loadedFilesService.restoreFiles(this.tmpLoadedFiles.files);
        }
        return throwError(() => error);
      }),
    );
  }

  parseRdfModel(payload: Array<{rdfAspectModel: string; sourceLocation: string}>) {
    return new RdfLoader().loadModel(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(error => throwError(() => ({code: LoadingCodeErrors.PARSING_RDF_MODEL, error}))),
    );
  }

  createRdfModelFromContent(rdfContent: string, absoluteFileName: string): Observable<NamespaceFile> {
    return this.parseRdfModel([{rdfAspectModel: rdfContent, sourceLocation: ''}]).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(rdfModel => this.registerPartialFile(rdfModel, absoluteFileName)),
      catchError(error => throwError(() => ({code: LoadingCodeErrors.LOADING_SINGLE_FILE, error}))),
    );
  }

  loadRdfModelsInSequence(
    files: [fileName: string, fileContent: string, sourceLocation: string][],
    result: Record<string, RdfModel> = {},
    index = 0,
  ): Observable<Record<string, RdfModel>> {
    const [fileName, fileContent, sourceLocation] = files[index];
    return this.parseRdfModel([{rdfAspectModel: fileContent, sourceLocation}]).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(rdfModel =>
        (++index < files.length ? this.loadRdfModelsInSequence(files, result, index) : of(null)).pipe(
          takeUntilDestroyed(this.destroyRef),
          map(() => {
            result[fileName] = rdfModel;
            return result;
          }),
        ),
      ),
      catchError(error => throwError(() => ({code: LoadingCodeErrors.SEQUENCE_LOADING, error}))),
    );
  }

  private getNamespaceDependencies(
    rdf: string,
    sourceLocation: string,
    namespaces: Record<string, string> = {},
    level = 1,
  ): Observable<Record<string, string>> {
    return this.parseRdfModel([{rdfAspectModel: rdf, sourceLocation: sourceLocation}]).pipe(
      switchMap(rdfModel => {
        const mainNamespace = rdfModel.getPrefixes()['']?.replace('urn:samm:', '')?.replace('#', '');
        const excludeSelf = Object.keys(namespaces).some(namespace => namespace.startsWith(mainNamespace));
        const dependencies = RdfModelUtil.resolveSpecificExternalNamespaces(rdfModel, excludeSelf);

        const fileEntries: Array<FileEntry> = [];
        for (const dependency of dependencies) {
          fileEntries.push({aspectModelUrn: dependency});
        }

        // elements missing in the workspace are left out and shown as placeholders instead of failing the whole loading
        return fileEntries.length > 0 ? this.modelApiService.fetchAllAspectMetaModel(fileEntries) : of([]);
      }),
      switchMap((fileInformations: Array<FileInformation>) => {
        const filteredFiles = fileInformations.filter((file, index, arr) => {
          const namespace = file.aspectModelUrn.split(/urn:samm:|#/).filter(Boolean);
          const key = `${namespace[0]}:${file.fileName}`;

          return (
            arr.findIndex(f => {
              const ns = f.aspectModelUrn.split(/urn:samm:|#/).filter(Boolean);
              const k = `${ns[0]}:${f.fileName}`;
              return k === key;
            }) === index
          );
        });

        filteredFiles.forEach(file => {
          const split = file.aspectModelUrn.split(/urn:samm:|#/).filter(Boolean);
          namespaces[`${split[0]}:${file.fileName}`] = file.aspectModel;
        });

        const recursiveCalls$ =
          filteredFiles.length > 0 && level === 0
            ? from(filteredFiles).pipe(
                concatMap(file => this.getNamespaceDependencies(file.aspectModel, '', namespaces)),
                map(() => [namespaces]),
              )
            : of([namespaces]);

        return recursiveCalls$;
      }),
      map(() => namespaces),
    );
  }

  private getAspectUrn(rdfModel: RdfModel): string | undefined {
    if (!rdfModel) return undefined;
    return rdfModel.store.getSubjects(rdfModel.samm.RdfType(), rdfModel.samm.Aspect(), null)?.[0]?.value;
  }

  /**
   * Loads the rdf models of the current model and its dependencies
   */
  private loadRdfModelFromFiles(files: Record<string, string>, payload: LoadModelPayload) {
    return this.loadRdfModelsInSequence([
      [payload.namespaceFileName || 'current', payload.rdfAspectModel, payload.aspectModelUri],
      ...Object.entries(files).map(([key, value]) => [key, value, ''] as [string, string, string]),
    ]).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(rdfModels => ({rdfModels, files})),
    );
  }

  private registerPartialFile(rdfModel: RdfModel, absoluteFileName: string, fromWorkspace = false) {
    return this.loadedFilesService.addFile({
      rdfModel,
      sharedRdfModel: null,
      cachedFile: null,
      aspect: null,
      absoluteName: absoluteFileName || '',
      rendered: false,
      fromWorkspace,
    });
  }

  private registerFiles(rdfModels: Record<string, RdfModel>, loadedFile: any, payload: LoadModelPayload, render = false) {
    let currentNamespaceFile: NamespaceFile;

    for (const [key, rdfModel] of Object.entries(rdfModels)) {
      const isCurrentFile = key === 'current' || key === payload.namespaceFileName;

      if (render && isCurrentFile) {
        const currentFile = this.loadedFilesService.currentLoadedFile;
        if (currentFile) currentFile.rendered = false;
      }

      const file = this.loadedFilesService.addFile(
        {
          rdfModel,
          sharedRdfModel: isCurrentFile ? loadedFile.rdfModel : null,
          cachedFile: isCurrentFile ? loadedFile.cachedElements : new ModelElementCache(),
          aspect: isCurrentFile ? loadedFile.aspect : null,
          absoluteName: isCurrentFile ? payload.namespaceFileName || '' : key,
          rendered: isCurrentFile && render,
          fromWorkspace: payload.fromWorkspace,
          aspectModelUrn: payload.aspectModelUrn,
        },
        isCurrentFile,
      );

      if (isCurrentFile) currentNamespaceFile = file;
    }

    return currentNamespaceFile;
  }

  private moveElementsToTheirCacheFile(rdfModels: Record<string, RdfModel>, loadedFile: any, payload: LoadModelPayload) {
    const rdfModelsEntries = Object.entries(rdfModels).filter(([key]) => key !== 'current' && key !== payload.namespaceFileName);
    // const elementsInWorkspace = [];
    for (const urn of loadedFile.cachedElements.getKeys()) {
      const namedNode = new NamedNode(urn);
      const [key, rdfModel] = rdfModelsEntries.find(([, rdfModel]) => rdfModel.store.countQuads(namedNode, null, null, null) > 0) || [];

      if (key && key !== 'current' && key !== payload.namespaceFileName && rdfModel) {
        // elementsInWorkspace.push({file: key, element: urn});
        const element: NamedElement = loadedFile.cachedElements.get(urn);
        if (element instanceof DefaultAspect) {
          this.notificationsService.warning({title: `Aspect "${urn}" found in workspace`});
          continue;
        }

        const fileCache = this.loadedFilesService.files[key].cachedFile;
        fileCache.resolveInstance<NamedElement>(element);
        loadedFile.cachedElements.removeElement(urn);
      }
    }

    // TODO Check this - No benifit for now ...
    // if (elementsInWorkspace.length) {
    //   const message = elementsInWorkspace.map(el => `${el.element} in file: ${el.file}. \n`).join('\n');
    //
    //   const version = RdfModelUtil.getNamespaceVersionFromRdf(payload.namespaceFileName);
    //   const fileName = RdfModelUtil.getFileNameFromRdf(payload.namespaceFileName);
    //   this.notificationsService.warning({title: `Aspect Model ${fileName} (v${version}) has newer element versions`, message});
    // }
  }

  /**
   * Moves the elements which are referenced but not defined in any loaded file (e.g. their file is missing in the
   * workspace) to placeholder files.
   *
   * @returns the URNs of the missing elements the current file references directly
   */
  private moveUnresolvedElements(rdfModels: Record<string, RdfModel>, currentRdfModel: RdfModel, cache: ModelElementCache): string[] {
    const isDefined = (node: NamedNode) => Object.values(rdfModels).some(rdfModel => rdfModel.store.countQuads(node, null, null, null) > 0);

    const unresolved = cache
      .getKeys()
      .map(urn => cache.get<NamedElement>(urn))
      .filter(
        element =>
          element?.aspectModelUrn?.startsWith('urn:samm:') &&
          !element.isPredefined &&
          !element.isAnonymous?.() &&
          !element.aspectModelUrn.startsWith('urn:samm:org.eclipse.esmf.samm:') &&
          !isDefined(new NamedNode(element.aspectModelUrn)),
      );

    if (!unresolved.length) return [];

    this.loadedFilesService.registerUnresolvedElements(unresolved, cache);
    return unresolved
      .map(element => element.aspectModelUrn)
      .filter(urn => currentRdfModel.store.countQuads(null, null, new NamedNode(urn), null) > 0)
      .sort();
  }

  private notifyMissingReferences(urns: string[]) {
    if (!urns.length) return;

    // selectTranslate waits for the translation file, which may not be loaded yet when a model is opened on start
    const translateService = this.translate.translateService;
    combineLatest([
      translateService.selectTranslate('notificationService.unresolvedReferencesTitle'),
      translateService.selectTranslate('notificationService.unresolvedReferencesMessage', {elements: urns.join(', ')}),
    ])
      .pipe(first())
      .subscribe(([title, message]) => this.notificationsService.warning({title, message, timeout: 10000}));
  }

  private migrateAspectModel(oldSammVersion: string, rdfAspectModel: string): Observable<string> {
    this.notificationsService.info({
      title: `Migrating from SAMM version ${oldSammVersion} to SAMM version ${config.currentSammVersion}`,
      timeout: 5000,
    });

    return this.modelApiService.migrateAspectModel(rdfAspectModel).pipe(
      takeUntilDestroyed(this.destroyRef),
      first(),
      tap(() =>
        this.notificationsService.info({
          title: `Successfully migrated from SAMM Version ${oldSammVersion} to SAMM version ${config.currentSammVersion} SAMM version`,
          timeout: 5000,
        }),
      ),
    );
  }
}
