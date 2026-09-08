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

import {ModelApiService, ModelData} from '@ame/api';
import {RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilePayload, LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
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
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {decodeText, readFile} from '@ame/utils';
import {DestroyRef, inject, Injectable} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {saveAs} from 'file-saver';
import {BlankNode, NamedNode, Store} from 'n3';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {catchError, finalize, first, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {ConfirmDialogService, DialogOptions} from '../../confirm-dialog/confirm-dialog.service';
import {ShapeSettingsStateService} from '../../editor-dialog/services/shape-settings-state.service';
import {EditorService} from '../../editor.service';
import {ModelLoaderService} from '../../model-loader.service';
import {ModelSaverService} from '../../model-saver.service';
import {ConfirmDialogEnum} from '../../models/confirm-dialog.enum';
import {FileUploadOptions} from '../interfaces/file-upload-options';
import {FileTypes, FileUploadService} from './file-upload.service';

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
  private maxgraphService = inject(MaxGraphService);
  private modelLoaderService = inject(ModelLoaderService);
  private loadedFilesService = inject(LoadedFilesService);
  private modelSaverService = inject(ModelSaverService);
  private titleService = inject(TitleService);
  private rdfNodeService = inject(RdfNodeService);

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
      title: this.translate.language?.notificationDialog?.LOADING,
      content: this.translate.language?.notificationDialog?.CONTENT,
      hasCloseButton: true,
    };
    this.loadingScreenService.open(loadingScreenOptions);

    return this.modelApiService.validate(modelContent).pipe(
      switchMap(validations => {
        const found = validations.find(({errorCode}) => errorCode === 'ERR_PROCESSING');
        return found
          ? throwError(() => found.message)
          : this.modelLoaderService.renderModel({aspectModelUri: '', rdfAspectModel: modelContent});
      }),
      catchError(httpError => {
        this.notificationsService.error({
          title: this.translate.language?.notificationService?.loadingError,
          message: httpError?.error?.error?.message,
          timeout: 5000,
        });
        return throwError(() => 'Load model failed');
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
            title: this.translate.language?.notificationDialog?.LOADING,
            hasCloseButton: true,
          };
          this.loadingScreenService.open(loadingScreenOptions);
        }),
        switchMap(model =>
          this.modelLoaderService.renderModel({
            aspectModelUri: model.sourceLocation,
            rdfAspectModel: model.content,
            aspectModelUrn,
            namespaceFileName: absoluteFileName,
            fromWorkspace: true,
          }),
        ),
        first(),
        catchError(httpError => {
          this.notificationsService.error({
            title: this.translate.language.notificationService.loadingError,
            message: httpError?.error?.error?.message,
            timeout: 5000,
          });
          return throwError(() => 'Load namespace file failed');
        }),
        finalize(() => {
          this.loadingScreenService.close();
          if (this.shapeSettingsStateService.isShapeSettingOpened()) {
            this.shapeSettingsStateService.closeShapeSettings();
          }
        }),
      )
      .subscribe();
  }

  /**
   * Loads an empty model with all the necessary dependencies.
   * The method defines the whole process of loading an empty model.
   *
   * @returns Observable<void>
   */
  loadEmptyModel() {
    this.loadingScreenService.open({
      title: this.translate.language.loadingScreenDialog.aspectModelLoading,
      content: this.translate.language.loadingScreenDialog.generalWaitMessage,
    });

    this.loadedFilesService.removeAll();

    const model = 'new-model.ttl';
    const namespaceName = 'com.examples';
    const namespaceVersion = '1.0.0';
    const namespace = `${namespaceName}:${namespaceVersion}`;
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

    return of(true).pipe(
      map(() => {
        this.sidebarService.sammElements.open();

        if (this.maxgraphService.graph?.model) {
          this.maxgraphService.deleteAllShapes();
        }

        this.modelSaveTracker.updateSavedModel(true);
        this.titleService.updateTitle(absoluteName);
      }),
      finalize(() => this.loadingScreenService.close()),
    );
  }

  onCopyToClipboard() {
    this.copyToClipboard()
      .pipe(first())
      .subscribe(fullText => {
        this.copyToClipboardSync(fullText);
      });
  }

  copyToClipboard(): Observable<any> {
    const rdfModel = this.currentLoadedFile?.rdfModel;

    if (!rdfModel) {
      return throwError(() => {
        console.error('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => this.rdfService.serializeModel(rdfModel)),
      switchMap(serializedModel => this.modelApiService.fetchFormatedAspectModel(serializedModel, rdfModel.getSourceLocation())),
      switchMap(formattedModel => {
        const header = this.configurationService.getSettings().copyrightHeader.join('\n');
        const fullText = header + '\n\n' + formattedModel;
        return of(fullText);
      }),
      catchError(httpError => {
        this.notificationsService.error({title: 'Copying error', message: httpError?.error?.error?.message});
        return throwError(() => 'Copying to clipboard failed');
      }),
      tap(() => {
        this.notificationsService.success({
          title: this.translate.language.saveMenu.copiedToClipboard,
          message: this.translate.language.notificationService.copiedToClipboardMessage,
          timeout: 5000,
        });
      }),
      first(),
    );
  }

  copyToClipboardSync(text: string) {
    if (!text) return;

    window.focus();

    if (navigator.clipboard && document.hasFocus()) {
      navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  onExportAsAspectModelFile() {
    this.exportAsAspectModelFile().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
  }

  exportAsAspectModelFile(): Observable<string> {
    const rdfModel = this.currentLoadedFile?.rdfModel;

    if (!rdfModel) {
      return throwError(() => {
        console.error('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    this.loadingScreenService.open({
      title: this.translate.language?.notificationDialog?.SAVING,
      content: this.translate.language?.notificationDialog?.CONTENT,
      hasCloseButton: false,
    });

    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => this.currentLoadedFile.absoluteName || 'undefined.ttl'),
      switchMap(fileName => {
        const rdfModelTtl = this.rdfService.serializeModel(rdfModel);
        return this.modelApiService.fetchFormatedAspectModel(rdfModelTtl, rdfModel.getSourceLocation()).pipe(
          tap(formattedModel => {
            const header = this.configurationService.getSettings().copyrightHeader.join('\n');
            saveAs(new Blob([header + '\n\n' + formattedModel], {type: 'text/turtle;charset=utf-8'}), fileName);
          }),
        );
      }),
      catchError(httpError => {
        this.notificationsService.error({
          title: this.translate.language?.notificationService?.exportingTitleError,
          message: httpError?.error?.error?.message,
          timeout: 5000,
        });
        return throwError(() => 'Exporting aspect model failed');
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
      title: this.translate.language.loadingScreenDialog.workspaceImport,
      hasCloseButton: false,
    };

    this.loadingScreenService.open(loadingOptions);

    return this.importFiles(file).pipe(
      tap(() => this.notificationsService.success({title: this.translate.language.notificationService.packageImportedSuccess})),
      catchError(httpError => {
        this.notificationsService.error({
          title: this.translate.language.notificationService.packageImportedError,
          message: httpError.error?.error?.message,
        });
        return throwError(() => 'Importing files to workspace failed');
      }),
      finalize(() => this.loadingScreenService.close()),
    );
  }

  addFileToWorkspace(fileName: string, fileContent: string, uploadOptions: FileUploadOptions = {}): Observable<RdfModel> {
    const loadingOptions: LoadingScreenOptions = {
      title: this.translate.language.loadingScreenDialog.workspaceImport,
      hasCloseButton: false,
    };
    if (uploadOptions.showLoading) this.loadingScreenService.open(loadingOptions);

    let newModelContent: string;
    let newModelAbsoluteFileName: string;

    return this.modelApiService.fetchFormatedAspectModel(fileContent).pipe(
      switchMap(formattedModel => {
        newModelContent = formattedModel;
        return this.modelApiService.validate(fileContent);
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
            title: this.translate.language.notificationService.fileAddedSuccessTitle,
            message: this.translate.language.notificationService.fileAddedSuccessMessage,
          });
        }
        this.sidebarService.workspace.refresh();
      }),
      switchMap(() => this.handleFileVersionConflicts(newModelAbsoluteFileName, newModelContent)),
      catchError(httpError => {
        if (uploadOptions.showNotifications) {
          this.notificationsService.error({
            title: this.translate.language.notificationService.fileAddedErrorTitle,
            message: httpError?.error?.error?.message || this.translate.language.notificationService.fileAddedErrorMessage,
          });
        }
        return throwError(() => 'Adding file to workspace failed');
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
          `${this.translate.language.confirmDialog.reloadConfirmation.versionChangeNotice} ${fileName} ${this.translate.language.confirmDialog.reloadConfirmation.workspaceLoadNotice}`,
          this.translate.language.confirmDialog.reloadConfirmation.reloadWarning,
        ],
        title: this.translate.language.confirmDialog.reloadConfirmation.title,
        closeButtonText: this.translate.language.confirmDialog.reloadConfirmation.closeButton,
        okButtonText: this.translate.language.confirmDialog.reloadConfirmation.okButton,
      })
      .pipe(map(confirm => confirm === ConfirmDialogEnum.ok));
  }

  onValidateFile() {
    if (!this.currentLoadedFile.cachedFile.getKeys().length) {
      this.notificationsService.info({
        title: this.translate.language?.notificationDialog?.NO_ASPECT_TITLE,
        timeout: 5000,
      });
      return;
    }
    this.validateFile().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  validateFile(callback?: Function) {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language?.notificationDialog?.VALIDATING,
      content: this.translate.language?.notificationDialog?.CONTENT,
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
          this.notificationsService.error({title: this.translate.language?.notificationService?.validationInProgress});
          return of(() => 'Validation in progress');
        }
        this.notificationsService.error({
          title: this.translate.language?.notificationService?.validationErrorTitle,
          message: this.translate.language?.notificationService?.validationErrorMessage,
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
        this.translate.translateService.translate('confirmDialog.namespaceChange.phrase1', {
          originalModelName: modelState.newFileName,
        }),
        this.translate.translateService.translate('confirmDialog.namespaceChange.phrase2', {
          originalModelNamespace: RdfModelUtil.getNamespaceFromRdf(modelState.originalModelName),
        }),
        this.translate.translateService.translate('confirmDialog.namespaceChange.phrase3', {
          newNamespace: RdfModelUtil.getNamespaceFromRdf(modelState.newModelName),
        }),
        this.translate.language.confirmDialog.namespaceChange.phrase4,
        this.translate.translateService.translate('confirmDialog.namespaceChange.phrase5', {
          originalModelName: modelState.newFileName,
        }),
        this.translate.translateService.translate('confirmDialog.namespaceChange.phrase6', {
          originalModelName: modelState.newFileName,
        }),
        this.translate.language.confirmDialog.namespaceChange.phrase7,
      ],
      title: this.translate.language.confirmDialog.namespaceChange.title,
      okButtonText: this.translate.language.confirmDialog.namespaceChange.okButton,
      actionButtonText: this.translate.language.confirmDialog.namespaceChange.actionButton,
      closeButtonText: this.translate.language.confirmDialog.namespaceChange.cancelButton,
    };

    const loadingDialogConfig: LoadingScreenOptions = {
      hasCloseButton: true,
      title: this.translate.language.loadingScreenDialog.savingToWorkspaceTitle,
      content: this.translate.language.loadingScreenDialog.savingToWorkspaceContent,
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
        const updatedPredicateQuadsCount = this.rdfNodeService.updateQuads({predicate: originalSubject}, {predicate: subject}, model);
        const updatedObjectQuadsCount = this.rdfNodeService.updateQuads({object: originalSubject}, {object: subject}, model);
        if (updatedPredicateQuadsCount || updatedObjectQuadsCount) affectedModels.push(model);
      });
    });

    return affectedModels;
  }

  private updateAffectedModels(models: RdfModel[], originalNamespace: string, newNamespace: string): Observable<RdfModel[]> {
    const requests = models.map(model => {
      const alias = model.getAliasByNamespace(`${originalNamespace}#`);

      if (alias) {
        model.updatePrefix(alias, originalNamespace, newNamespace);
      } else {
        model.addPrefix('ext-namespace', `${newNamespace}#`);
      }

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
    const title = this.translate.language.notificationService.renamedFileTitle;
    const message = this.translate.translateService.translate('notificationService.renamedFileMessage', {
      oldFile: modelState.oldFileName,
      newFile: modelState.newFileName,
    });

    this.notificationsService.info({title, message});
  }

  /**
   * Loads all models from a workspace which belong to a specific namespace.
   *
   * @param namespaceName - a name of the target namespace
   * @param namespaceVersion - a version of the target namespace
   * @returns - a list of loaded files
   */
  loadWorkspaceModelsByNamespace(namespaceName: string, namespaceVersion: string) {
    return this.getAllWorkspaceModelsByNamespace(namespaceName, namespaceVersion).pipe(
      switchMap(modelsData => this.loadNamespaceModels(`${namespaceName}:${namespaceVersion}`, modelsData)),
    );
  }

  /**
   * Gets all models from a workspace which belong to a specific namespace.
   *
   * @param namespaceName - a name of the target namespace
   * @param namespaceVersion - a version of the target namespace
   * @returns - a list of model data objects
   */
  private getAllWorkspaceModelsByNamespace(namespaceName: string, namespaceVersion: string) {
    return this.modelApiService.loadNamespacesStructure().pipe(
      map(namespacesStructure => {
        const targetNamespaces = namespacesStructure?.[namespaceName];
        const targetNamespace = targetNamespaces?.find(ns => ns?.version === namespaceVersion);
        return targetNamespace?.models ?? [];
      }),
    );
  }

  /**
   * Loads models associated with a specific namespace.
   * Adds files to LoadedFilesService accordingly.
   *
   * @param namespace - the target namespace to load models from
   * @param modelsData - data of the models to load (typically taken from a workspace structure, e.g. from ModelApiService.loadNamespacesStructure method)
   * @returns - a list of loaded files
   */
  private loadNamespaceModels(namespace: string, modelsData: ModelData[]) {
    const workspaceModelsRequests = modelsData.map(modelData =>
      forkJoin([
        of(`${namespace}:${modelData.name}`),
        this.modelApiService.fetchAspectMetaModel(modelData.aspectModelUrn).pipe(map(model => model.content)),
      ]),
    );

    if (!workspaceModelsRequests.length) {
      return of({});
    }

    return forkJoin(workspaceModelsRequests).pipe(
      switchMap(files =>
        this.modelLoaderService.loadRdfModelsInSequence(
          files.map(([fileName, fileContent]) => [fileName, fileContent, ''] as [string, string, string]),
        ),
      ),
      map(models => {
        const filesInfo = this.buildFilesInfo(models, modelsData);
        return this.loadedFilesService.addFiles(filesInfo);
      }),
    );
  }

  /**
   * Builds a list of files info to be added to LoadedFilesService
   *
   * @param models - a list of loaded models
   * @param modelsData - data of the models to load
   * @returns - a list of files info
   */
  private buildFilesInfo(models: Record<string, RdfModel>, modelsData: ModelData[]) {
    return modelsData.map(({aspectModelUrn, name}) => {
      const absoluteName = `${aspectModelUrn.substring('urn:samm:'.length, aspectModelUrn.indexOf('#'))}:${name}`;
      const rdfModel = models[absoluteName];
      if (!rdfModel) console.error(`Unable to find a model by key "${absoluteName}"`);

      return {
        aspectModelUrn,
        rdfModel,
        absoluteName,
        sharedRdfModel: null,
        cachedFile: new ModelElementCache(),
        aspect: null,
        rendered: false,
        fromWorkspace: true,
      } as LoadedFilePayload;
    });
  }

  isFileExistOnWorkspace(namespaceName: string, namespaceVersion: string, fileName: string): Observable<boolean> {
    return this.getAllWorkspaceModelsByNamespace(namespaceName, namespaceVersion).pipe(
      map((models: ModelData[]) => models.some((model: ModelData) => model.name === fileName)),
    );
  }
}
