/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {
  ConfirmDialogService,
  DialogOptions,
  EditorService,
  FileTypes,
  FileUploadOptions,
  FileUploadService,
  ModelLoaderService,
  ModelSaverService,
  ShapeSettingsStateService,
} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {ConfigurationService} from '@ame/settings-dialog';
import {
  ElectronSignalsService,
  GeneralConfig,
  LoadingScreenOptions,
  LoadingScreenService,
  ModelSavingTrackerService,
  NotificationsService,
  SaveValidateErrorsCodes,
  TitleService,
} from '@ame/shared';
import {FileStatus, SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {decodeText, readFile} from '@ame/utils';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {saveAs} from 'file-saver';
import {BlankNode, NamedNode, Quad, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject, Store} from 'n3';
import {Observable, forkJoin, from, of, throwError} from 'rxjs';
import {catchError, finalize, first, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {ConfirmDialogEnum} from '../../models/confirm-dialog.enum';

export interface FileInfo {
  content: BufferSource;
  path: string;
  name: string;
}

export interface FileInfoParsed extends Omit<FileInfo, 'content'> {
  content: string;
}

interface ModelLoaderState {
  /** Original model absolute file urn */
  originalModelName: string;
  /** New model absolute file urn */
  newModelName: string;
  /** Original file name */
  oldFileName: string;
  /** New model name got after renaming or removing the Aspect */
  newFileName: string;
  /** Boolean representing if model was loaded from workspace */
  loadedFromWorkspace: boolean;
  /** Boolean representing if the original file name was changed */
  isNameChanged: boolean;
  /** Boolean representing if name or version of the namespace was changed */
  isNamespaceChanged: boolean;
}

interface QuadComponents {
  subject?: Quad_Subject;
  predicate?: Quad_Predicate;
  object?: Quad_Object;
  graph?: Quad_Graph;
}

@Injectable({providedIn: 'root'})
export class FileHandlingService {
  private destroyRef = inject(DestroyRef);
  private editorService = inject(EditorService);
  private modelService = inject(ModelService);
  private rdfService = inject(RdfService);
  private modelApiService = inject(ModelApiService);
  private confirmDialogService = inject(ConfirmDialogService);
  private notificationsService = inject(NotificationsService);
  private loadingScreenService = inject(LoadingScreenService);
  private sidebarService = inject(SidebarStateService);
  private translate = inject(LanguageTranslationService);
  private electronSignalsService = inject(ElectronSignalsService);
  private configurationService = inject(ConfigurationService);
  private modelSaveTracker = inject(ModelSavingTrackerService);
  private fileUploadService = inject(FileUploadService);
  private shapeSettingsStateService = inject(ShapeSettingsStateService);
  private mxGraphService = inject(MxGraphService);
  private modelLoaderService = inject(ModelLoaderService);
  private loadedFilesService = inject(LoadedFilesService);
  private modelSaverService = inject(ModelSaverService);
  private titleService = inject(TitleService);

  get currentLoadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor() {
    if (!environment.production) {
      window['angular.fileHandlingService'] = this;
    }
  }

  onLoadModel(fileInfo?: FileInfo) {
    this.loadModel(decodeText(fileInfo.content)).pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
  }

  loadModel(modelContent: string): Observable<any> {
    if (!modelContent) return of(null);

    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.NOTIFICATION_DIALOG?.LOADING,
      content: this.translate.language.NOTIFICATION_DIALOG?.CONTENT,
      hasCloseButton: true,
    };
    this.loadingScreenService.open(loadingScreenOptions);

    return this.modelApiService.validate(modelContent).pipe(
      switchMap(validations => {
        const found = validations.find(({errorCode}) => errorCode === 'ERR_PROCESSING');
        return found ? throwError(() => found.message) : this.modelLoaderService.renderModel({rdfAspectModel: modelContent});
      }),
      catchError(error => {
        this.notificationsService.info({
          title: this.translate.language.NOTIFICATION_SERVICE.LOADING_ERROR,
          message: error.message,
          timeout: 5000,
        });
        return of(null);
      }),
      finalize(() => {
        this.modelSaveTracker.updateSavedModel(true);
        this.loadingScreenService.close();
        if (this.currentLoadedFile?.rdfModel) {
          this.shapeSettingsStateService.closeShapeSettings();
        }
        this.sidebarService.workspace.close();
      }),
    );
  }

  loadNamespaceFile(absoluteFileName: string, aspectModelUrn: string) {
    this.modelApiService
      .fetchAspectMetaModel(aspectModelUrn)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        tap(() => {
          const loadingScreenOptions: LoadingScreenOptions = {
            title: this.translate.language.NOTIFICATION_DIALOG?.LOADING,
            hasCloseButton: true,
          };
          this.loadingScreenService.open(loadingScreenOptions);
        }),
        switchMap((rdfAspectModel: string) =>
          this.modelLoaderService.renderModel({
            rdfAspectModel,
            aspectModelUrn,
            namespaceFileName: absoluteFileName,
            fromWorkspace: true,
          }),
        ),
        first(),
        catchError(error => {
          console.error('sidebar.component -> loadNamespaceFile', error);

          this.notificationsService.error({
            title: this.translate.language.NOTIFICATION_SERVICE.LOADING_ERROR,
            message: `${error?.message || error?.error?.message || error}`,
            timeout: 5000,
          });
          return throwError(() => error);
        }),
        finalize(() => {
          this.loadingScreenService.close();
          if (this.shapeSettingsStateService.isShapeSettingOpened) {
            this.shapeSettingsStateService.closeShapeSettings();
          }
        }),
      )
      .subscribe();
  }

  createEmptyModel() {
    this.loadedFilesService.removeAll();
    let fileStatus: FileStatus;

    if (this.currentLoadedFile) {
      const [namespace, version, file] = this.currentLoadedFile.absoluteName;
      const namespaceVersion = `${namespace}:${version}`;
      fileStatus = this.sidebarService.namespacesState.getFile(namespaceVersion, file);

      if (fileStatus) {
        fileStatus.locked = false;
        this.electronSignalsService.call('removeLock', {namespace: namespaceVersion, file: file});
      }
    }

    const model = 'new-model.ttl';
    const namespace = 'com.examples:1.0.0';
    const absoluteName = `${namespace}:${model}`;
    const rdfModel = new RdfModel(new Store(), GeneralConfig.sammVersion, `urn:samm:${namespace}`);

    this.loadedFilesService.addFile({
      rdfModel,
      absoluteName,
      cachedFile: new ModelElementCache(),
      aspect: null,
      rendered: true,
      fromWorkspace: false,
    });

    this.sidebarService.sammElements.open();

    if (this.mxGraphService.graph?.model) {
      this.mxGraphService.deleteAllShapes();
    }

    this.modelSaveTracker.updateSavedModel(true);
    this.titleService.updateTitle(absoluteName);
  }

  onCopyToClipboard() {
    this.copyToClipboard().pipe(first()).subscribe();
  }

  copyToClipboard(): Observable<any> {
    if (!this.currentLoadedFile?.rdfModel) {
      return throwError(() => {
        console.error('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => this.rdfService.serializeModel(this.currentLoadedFile?.rdfModel)),
      switchMap(serializedModel => this.modelApiService.fetchFormatedAspectModel(serializedModel)),
      switchMap(formattedModel => {
        const header = this.configurationService.getSettings().copyrightHeader.join('\n');
        return from(navigator.clipboard.writeText(header + '\n\n' + formattedModel));
      }),
      catchError(error => {
        this.notificationsService.error({title: 'Copying error', message: error?.error?.message});
        return throwError(() => error);
      }),
      tap(() => {
        this.notificationsService.success({
          title: this.translate.language.SAVE_MENU.COPIED_TO_CLIPBOARD,
          message: this.translate.language.NOTIFICATION_SERVICE.COPIED_TO_CLIPBOARD_MESSAGE,
          timeout: 5000,
        });
      }),
      first(),
    );
  }

  onExportAsAspectModelFile() {
    this.exportAsAspectModelFile().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
  }

  exportAsAspectModelFile(): Observable<string> {
    if (!this.currentLoadedFile?.rdfModel) {
      return throwError(() => {
        console.error('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    this.loadingScreenService.open({
      title: this.translate.language.NOTIFICATION_DIALOG?.SAVING,
      content: this.translate.language.NOTIFICATION_DIALOG?.CONTENT,
      hasCloseButton: false,
    });

    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => this.currentLoadedFile.absoluteName || 'undefined.ttl'),
      switchMap(fileName => {
        const rdfModelTtl = this.rdfService.serializeModel(this.currentLoadedFile?.rdfModel);
        return this.modelApiService.fetchFormatedAspectModel(rdfModelTtl).pipe(
          tap(formattedModel => {
            const header = this.configurationService.getSettings().copyrightHeader.join('\n');
            saveAs(new Blob([header + '\n\n' + formattedModel], {type: 'text/turtle;charset=utf-8'}), fileName);
          }),
        );
      }),
      catchError(error => {
        console.error(`Error while exporting the Aspect Model. ${JSON.stringify(error)}.`);
        this.notificationsService.error({
          title: this.translate.language.NOTIFICATION_SERVICE.EXPORTING_TITLE_ERROR,
          message: `${error?.error?.message || error}`,
          timeout: 5000,
        });
        return throwError(() => error);
      }),
      finalize(() => this.loadingScreenService.close()),
    );
  }

  onSaveAspectModelToWorkspace() {
    this.saveAspectModelToWorkspace().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
  }

  saveAspectModelToWorkspace(): Observable<any> {
    let modelState: ModelLoaderState;

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.getModelLoaderState()),
      tap(state => (modelState = state)),
      switchMap(() => this.handleNamespaceChange(modelState)),
      switchMap(confirm => (confirm !== ConfirmDialogEnum.cancel ? this.modelSaverService.saveModel() : of(null))),
      tap(rdfModel => this.handleRdfModel(rdfModel, modelState)),
      finalize(() => {
        this.modelSaveTracker.updateSavedModel();
        this.loadingScreenService.close();
      }),
    );
  }

  onAddFileToNamespace(fileInfo?: FileInfo): void {
    this.resolveModelFileContent(fileInfo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(fileInfo => this.addFileToNamespace(fileInfo)),
        first(),
      )
      .subscribe();
  }

  resolveModelFileContent(fileInfo?: FileInfo): Observable<FileInfoParsed> {
    return fileInfo
      ? of({
          ...fileInfo,
          content: decodeText(fileInfo.content),
        })
      : this.selectFile();
  }

  addFileToNamespace(fileInfo: FileInfoParsed): Observable<any> {
    return this.addFileToWorkspace(fileInfo.name, fileInfo.content, {showNotifications: true}).pipe(
      map(() => this.electronSignalsService.call('requestRefreshWorkspaces')),
    );
  }

  selectFile(): Observable<FileInfoParsed> {
    return this.fileUploadService.selectFile([FileTypes.TTL]).pipe(
      switchMap((file: File) =>
        forkJoin({
          content: readFile(file),
          path: of(file.webkitRelativePath),
          name: of(file.webkitRelativePath.split('/').pop()),
        }),
      ),
    );
  }

  importFilesToWorkspace(file: File): Observable<RdfModel[]> {
    const loadingOptions: LoadingScreenOptions = {
      title: this.translate.language.LOADING_SCREEN_DIALOG.WORKSPACE_IMPORT,
      hasCloseButton: false,
    };

    this.loadingScreenService.open(loadingOptions);

    return this.importFiles(file).pipe(
      tap(() => this.notificationsService.success({title: this.translate.language.NOTIFICATION_SERVICE.PACKAGE_IMPORTED_SUCCESS})),
      catchError(httpError => {
        // @TODO Temporary check until file blockage is fixed
        !httpError.error?.error?.message?.includes('import')
          ? this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.PACKAGE_IMPORTED_ERROR})
          : this.notificationsService.success({title: this.translate.language.NOTIFICATION_SERVICE.PACKAGE_IMPORTED_SUCCESS});

        return of(null);
      }),
      finalize(() => this.loadingScreenService.close()),
    );
  }

  addFileToWorkspace(fileName: string, fileContent: string, uploadOptions: FileUploadOptions = {}): Observable<RdfModel> {
    const loadingOptions: LoadingScreenOptions = {
      title: this.translate.language.LOADING_SCREEN_DIALOG.WORKSPACE_IMPORT,
      hasCloseButton: false,
    };
    if (uploadOptions.showLoading) this.loadingScreenService.open(loadingOptions);

    let newModelContent: string;
    let newModelAbsoluteFileName: string;

    return this.modelApiService.fetchFormatedAspectModel(fileContent).pipe(
      switchMap(formattedModel => {
        newModelContent = formattedModel;
        return this.modelApiService.validate(fileContent, false);
      }),
      switchMap(validations => {
        const found = validations.find(({errorCode}) => errorCode === 'ERR_PROCESSING');
        return found
          ? throwError(() => found.message)
          : this.modelLoaderService.createRdfModelFromContent(newModelContent, '::' + fileName);
      }),
      tap(({absoluteName}) => (newModelAbsoluteFileName = absoluteName)),
      switchMap((file: NamespaceFile) => {
        return this.modelApiService.saveAspectModel(newModelContent, file.getAnyAspectModelUrn(), newModelAbsoluteFileName);
      }),
      tap(() => {
        if (uploadOptions.showNotifications) {
          this.notificationsService.success({
            title: this.translate.language.NOTIFICATION_SERVICE.FILE_ADDED_SUCCESS_TITLE,
            message: this.translate.language.NOTIFICATION_SERVICE.FILE_ADDED_SUCCESS_MESSAGE,
          });
        }
        this.sidebarService.workspace.refresh();
      }),
      switchMap(() => this.handleFileVersionConflicts(newModelAbsoluteFileName, newModelContent)),
      catchError(error => {
        console.error(`'Error adding file to namespaces. ${JSON.stringify(error)}.`);
        if (uploadOptions.showNotifications) {
          this.notificationsService.error({
            title: this.translate.language.NOTIFICATION_SERVICE.FILE_ADDED_ERROR_TITLE,
            message: error || this.translate.language.NOTIFICATION_SERVICE.FILE_ADDED_ERROR_MESSAGE,
          });
        }
        return throwError(() => error);
      }),
      finalize(() => (uploadOptions.showLoading ? this.loadingScreenService.close() : null)),
    );
  }

  private handleFileVersionConflicts(fileName: string, fileContent: string): Observable<RdfModel> {
    const currentModel = this.currentLoadedFile;

    if (!currentModel.fromWorkspace || fileName !== this.currentLoadedFile.absoluteName) return of(this.currentLoadedFile.rdfModel);

    return this.rdfService.isSameModelContent(fileName, fileContent, currentModel).pipe(
      switchMap(isSameModelContent => (!isSameModelContent ? this.openReloadConfirmationDialog(currentModel.absoluteName) : of(false))),
      switchMap(isApprove => (isApprove ? this.modelLoaderService.createRdfModelFromContent(fileContent, fileName) : of(null))),
      map((file: NamespaceFile) => file.rdfModel),
    );
  }

  private openReloadConfirmationDialog(fileName: string): Observable<boolean> {
    return this.confirmDialogService
      .open({
        phrases: [
          `${this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.VERSION_CHANGE_NOTICE} ${fileName} ${this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.WORKSPACE_LOAD_NOTICE}`,
          this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.RELOAD_WARNING,
        ],
        title: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.TITLE,
        closeButtonText: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.CLOSE_BUTTON,
        okButtonText: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.OK_BUTTON,
      })
      .pipe(map(confirm => confirm === ConfirmDialogEnum.ok));
  }

  onValidateFile() {
    if (!this.currentLoadedFile.cachedFile.getKeys().length) {
      this.notificationsService.info({
        title: this.translate.language.NOTIFICATION_DIALOG?.NO_ASPECT_TITLE,
        timeout: 5000,
      });
      return;
    }
    this.validateFile().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
  }

  validateFile(callback?: Function) {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.NOTIFICATION_DIALOG?.VALIDATING,
      content: this.translate.language.NOTIFICATION_DIALOG?.CONTENT,
      hasCloseButton: true,
    };
    this.loadingScreenService.open(loadingScreenOptions);

    return this.editorService.validate().pipe(
      map(correctableErrors => {
        this.loadingScreenService.close();
        if (correctableErrors?.length === 0) {
          callback?.call(this);
        }
      }),
      catchError(error => {
        this.loadingScreenService.close();
        if (error?.type === SaveValidateErrorsCodes.validationInProgress) {
          this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_IN_PROGRESS});
          return of(() => 'Validation in progress');
        }
        this.notificationsService.error({
          title: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_ERROR_TITLE,
          message: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_ERROR_MESSAGE,
          timeout: 5000,
        });
        console.error(`Error occurred while validating the current model (${JSON.stringify(error)})`);
        return throwError(() => 'Validation completed with errors');
      }),
      finalize(() => localStorage.removeItem('validating')),
    );
  }

  private importFiles(file: File): Observable<any> {
    return this.modelApiService.importPackage(file);
  }

  private getModelLoaderState(): Observable<ModelLoaderState> {
    const currentFile = this.currentLoadedFile;
    const response: ModelLoaderState = {
      originalModelName: currentFile.originalAbsoluteName,
      newModelName: currentFile.absoluteName,
      oldFileName: currentFile.originalName?.split(':')?.pop(),
      newFileName: currentFile.absoluteName?.split(':')?.pop(),
      loadedFromWorkspace: currentFile.fromWorkspace,
      isNameChanged: currentFile.isNameChanged,
      isNamespaceChanged: currentFile.isNamespaceChanged,
    };
    return of(response);
  }

  private handleNamespaceChange(modelState: ModelLoaderState): Observable<string> {
    if (!modelState.isNamespaceChanged) {
      return of(ConfirmDialogEnum.action);
    }

    const confirmationDialogConfig: DialogOptions = {
      phrases: [
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE1', {
          originalModelName: modelState.newFileName,
        }),
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE2', {
          originalModelNamespace: RdfModelUtil.getNamespaceFromRdf(modelState.originalModelName),
        }),
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE3', {
          newNamespace: RdfModelUtil.getNamespaceFromRdf(modelState.newModelName),
        }),
        this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE4,
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE5', {
          originalModelName: modelState.newFileName,
        }),
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE6', {
          originalModelName: modelState.newFileName,
        }),
        this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE7,
      ],
      title: this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.TITLE,
      okButtonText: this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.OK_BUTTON,
      actionButtonText: this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.ACTION_BUTTON,
      closeButtonText: this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.CANCEL_BUTTON,
    };

    const loadingDialogConfig: LoadingScreenOptions = {
      hasCloseButton: true,
      title: this.translate.language.LOADING_SCREEN_DIALOG.SAVING_TO_WORKSPACE_TITLE,
      content: this.translate.language.LOADING_SCREEN_DIALOG.SAVING_TO_WORKSPACE_CONTENT,
    };

    return this.confirmDialogService.open(confirmationDialogConfig).pipe(
      tap(() => this.loadingScreenService.open(loadingDialogConfig)),
      switchMap(confirm => {
        if (confirm === ConfirmDialogEnum.ok) {
          return this.migrateAffectedModels(modelState.originalModelName, modelState.newModelName).pipe(map(() => confirm));
        }

        return of(confirm);
      }),
    );
  }
  // TODO MOVE THESE 3 FUNCTION TO A MORE RELATED SERVICE

  updateQuads(query: QuadComponents, replacement: QuadComponents, rdfModel: RdfModel): number {
    const quads: Quad[] = this.getQuads(query, rdfModel);
    return quads.reduce((counter, quad) => {
      this.modifyQuad(replacement, quad, rdfModel);
      return ++counter;
    }, 0);
  }

  getQuads(query: QuadComponents, rdfModel: RdfModel): Quad[] {
    return rdfModel.store.getQuads(query.subject || null, query.predicate || null, query.object || null, query.graph || null);
  }

  modifyQuad(replacement: QuadComponents, quad: Quad, rdfModel: RdfModel): void {
    const updatedQuad: [Quad_Subject, Quad_Predicate, Quad_Object, Quad_Graph] = [
      replacement.subject || quad.subject,
      replacement.predicate || quad.predicate,
      replacement.object || quad.object,
      replacement.graph || quad.graph,
    ];
    rdfModel.store.addQuad(...updatedQuad);
    rdfModel.store.removeQuad(quad);
  }

  private migrateAffectedModels(originalModelName: string, newModelName: string): Observable<RdfModel[]> {
    const originalNamespace = RdfModelUtil.getUrnFromFileName(originalModelName);
    const newNamespace = RdfModelUtil.getUrnFromFileName(newModelName);
    const affectedModels = this.updateAffectedQuads(originalModelName, originalNamespace, newNamespace);
    return this.updateAffectedModels(affectedModels, originalNamespace, newNamespace);
  }

  public updateAffectedQuads(originalModelName: string, originalNamespace: string, newNamespace: string): RdfModel[] {
    const subjects = this.currentLoadedFile.rdfModel.store.getSubjects(null, null, null);
    const models: RdfModel[] = Object.values(this.loadedFilesService.files)
      .filter(model => model.absoluteName !== originalModelName)
      .map(file => file.rdfModel);

    const affectedModels: RdfModel[] = [];

    subjects.forEach(subject => {
      if (subject instanceof BlankNode) return;
      if (!subject.value.startsWith(newNamespace)) return;
      const subjectName = subject.value.split('#').pop();
      const originalSubject = new NamedNode(`${originalNamespace}#${subjectName}`);

      models.forEach(model => {
        const updatedPredicateQuadsCount = this.updateQuads({predicate: originalSubject}, {predicate: subject}, model);
        const updatedObjectQuadsCount = this.updateQuads({object: originalSubject}, {object: subject}, model);
        if (updatedPredicateQuadsCount || updatedObjectQuadsCount) affectedModels.push(model);
      });
    });

    return affectedModels;
  }

  private updateAffectedModels(models: RdfModel[], originalNamespace: string, newNamespace: string): Observable<RdfModel[]> {
    const requests = models.map(model => {
      const alias = model.getAliasByNamespace(`${originalNamespace}#`);
      alias ? model.updatePrefix(alias, originalNamespace, newNamespace) : model.addPrefix('ext-namespace', `${newNamespace}#`);
      return this.modelSaverService.saveModel(model);
    });
    return requests.length ? forkJoin(requests) : of([]);
  }

  private handleRdfModel(rdfModel: RdfModel, modelState: ModelLoaderState): void {
    if (!rdfModel) {
      return;
    }

    if (modelState.isNameChanged) {
      this.showFileNameChangeNotification(modelState);
    }

    this.currentLoadedFile?.resetOriginalUrn();
    this.currentLoadedFile?.setExistsInWorkspace();

    this.electronSignalsService.call('updateWindowInfo', {
      namespace: this.currentLoadedFile?.namespace || '',
      fromWorkspace: true,
      file: this.currentLoadedFile?.name,
    });
  }

  private showFileNameChangeNotification(modelState: ModelLoaderState): void {
    const title = this.translate.language.NOTIFICATION_SERVICE.RENAMED_FILE_TITLE;
    const message = this.translate.translateService.instant('NOTIFICATION_SERVICE.RENAMED_FILE_MESSAGE', {
      oldFile: modelState.oldFileName,
      newFile: modelState.newFileName,
    });

    this.notificationsService.info({title, message});
  }
}
