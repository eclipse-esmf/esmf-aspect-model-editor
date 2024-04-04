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

import {Injectable} from '@angular/core';
import {
  ConfirmDialogService,
  DialogOptions,
  EditorService,
  FileTypes,
  FileUploadOptions,
  FileUploadService,
  ShapeSettingsStateService,
} from '@ame/editor';
import {catchError, filter, finalize, first, map, switchMap, tap} from 'rxjs/operators';
import {forkJoin, from, Observable, of, throwError} from 'rxjs';
import {
  ElectronSignalsService,
  LoadingScreenOptions,
  LoadingScreenService,
  LogService,
  ModelSavingTrackerService,
  NotificationsService,
  SaveValidateErrorsCodes,
} from '@ame/shared';
import {saveAs} from 'file-saver';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ModelApiService} from '@ame/api';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {MigratorService} from '@ame/migrator';
import {BlankNode, NamedNode, Store} from 'n3';
import {Title} from '@angular/platform-browser';
import {LanguageTranslationService} from '@ame/translation';
import {ConfigurationService} from '@ame/settings-dialog';
import {environment} from '../../../../../../environments/environment';
import {SidebarStateService} from '@ame/sidebar';
import {decodeText, readFile} from '@ame/utils';
import {MxGraphService} from '@ame/mx-graph';

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

@Injectable({
  providedIn: 'root',
})
export class FileHandlingService {
  constructor(
    private logService: LogService,
    private editorService: EditorService,
    private modelService: ModelService,
    private rdfService: RdfService,
    private modelApiService: ModelApiService,
    private confirmDialogService: ConfirmDialogService,
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService,
    private namespaceCacheService: NamespacesCacheService,
    private migratorService: MigratorService,
    private sidebarService: SidebarStateService,
    private titleService: Title,
    private translate: LanguageTranslationService,
    private electronSignalsService: ElectronSignalsService,
    private configurationService: ConfigurationService,
    private modelSaveTracker: ModelSavingTrackerService,
    private fileUploadService: FileUploadService,
    private shapeSettingsStateService: ShapeSettingsStateService,
    private mxGraphService: MxGraphService,
  ) {
    if (!environment.production) {
      window['angular.fileHandlingService'] = this;
    }
  }

  onLoadModel(fileInfo?: FileInfo) {
    this.loadModel(decodeText(fileInfo.content)).pipe(first()).subscribe();
  }

  loadModel(modelContent: string): Observable<Array<RdfModel>> {
    if (!modelContent) return of(null);

    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.NOTIFICATION_DIALOG.LOADING,
      content: this.translate.language.NOTIFICATION_DIALOG.CONTENT,
      hasCloseButton: true,
    };
    this.loadingScreenService.open(loadingScreenOptions);
    const migratedModel = this.migratorService.bammToSamm(modelContent);

    return this.modelApiService.validate(migratedModel).pipe(
      switchMap(validations => {
        const found = validations.find(({errorCode}) => errorCode === 'ERR_PROCESSING');
        return found ? throwError(() => found.message) : this.editorService.loadNewAspectModel({rdfAspectModel: migratedModel});
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
        if (this.modelService.getLoadedAspectModel().rdfModel) {
          this.shapeSettingsStateService.closeShapeSettings();
        }
        this.sidebarService.workspace.close();
      }),
    );
  }

  loadNamespaceFile(absoluteFileName: string) {
    const subscription = this.modelApiService
      .getAspectMetaModel(absoluteFileName)
      .pipe(
        first(),
        tap(() => {
          const loadingScreenOptions: LoadingScreenOptions = {
            title: this.translate.language.NOTIFICATION_DIALOG.LOADING,
            hasCloseButton: true,
            closeButtonAction: () => {
              subscription.unsubscribe();
            },
          };
          this.loadingScreenService.open(loadingScreenOptions);
        }),
        switchMap(rdfAspectModel =>
          this.editorService
            .loadNewAspectModel({
              rdfAspectModel,
              namespaceFileName: absoluteFileName,
              fromWorkspace: true,
            })
            .pipe(
              first(),
              catchError(error => {
                console.groupCollapsed('sidebar.component -> loadNamespaceFile', error);
                console.groupEnd();

                this.notificationsService.error({
                  title: this.translate.language.NOTIFICATION_SERVICE.LOADING_ERROR,
                  message: `${error}`,
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
            ),
        ),
      )
      .subscribe();
  }

  createEmptyModel() {
    this.namespaceCacheService.removeAll();
    const currentRdfModel = this.rdfService.currentRdfModel;
    let fileStatus;
    if (currentRdfModel) {
      const [namespace, version, file] = this.rdfService.currentRdfModel.absoluteAspectModelFileName.split(':');
      const namespaceVersion = `${namespace}:${version}`;
      fileStatus = this.sidebarService.namespacesState.getFile(namespaceVersion, file);

      if (fileStatus) {
        fileStatus.locked = false;
        this.electronSignalsService.call('removeLock', {namespace: namespaceVersion, file: file});
      }
    }

    const emptyNamespace = 'urn:samm:org.eclipse.esmf:1.0.0#';
    const fileName = 'empty.ttl';
    const newRdfModel = new RdfModel().initRdfModel(new Store(), {'': emptyNamespace as any}, 'empty');
    const oldFile = this.namespaceCacheService.currentCachedFile;

    this.sidebarService.sammElements.open();

    newRdfModel.absoluteAspectModelFileName = `${emptyNamespace}:${fileName}`;
    this.rdfService.currentRdfModel = newRdfModel;
    if (oldFile) {
      this.namespaceCacheService.removeFile(oldFile.namespace, oldFile.fileName);
    }

    this.namespaceCacheService.currentCachedFile = new CachedFile(fileName, emptyNamespace);

    if (this.mxGraphService.graph?.model) {
      this.mxGraphService.deleteAllShapes();
    }

    this.modelService.addAspect(null);
    this.modelSaveTracker.updateSavedModel(true);

    const loadExternalModels$ = this.editorService
      .loadExternalModels()
      .pipe(finalize(() => loadExternalModels$.unsubscribe()))
      .subscribe();
  }

  onCopyToClipboard() {
    this.copyToClipboard().pipe(first()).subscribe();
  }

  copyToClipboard(): Observable<any> {
    if (!this.modelService.currentRdfModel) {
      return throwError(() => {
        this.logService.logError('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => this.rdfService.serializeModel(this.modelService.currentRdfModel)),
      switchMap(serializedModel => this.modelApiService.formatModel(serializedModel)),
      switchMap(formattedModel => {
        const header = this.configurationService.getSettings().copyrightHeader.join('\n');
        return from(navigator.clipboard.writeText(header + '\n\n' + formattedModel));
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
    this.exportAsAspectModelFile().pipe(first()).subscribe();
  }

  exportAsAspectModelFile(): Observable<string> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    this.loadingScreenService.open({
      title: this.translate.language.NOTIFICATION_DIALOG.SAVING,
      content: this.translate.language.NOTIFICATION_DIALOG.CONTENT,
      hasCloseButton: false,
    });

    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => this.rdfService.currentRdfModel.aspectModelFileName || 'undefined.ttl'),
      switchMap(fileName => {
        const rdfModelTtl = this.rdfService.serializeModel(this.modelService.currentRdfModel);
        return this.modelApiService.formatModel(rdfModelTtl).pipe(
          tap(formattedModel => {
            const header = this.configurationService.getSettings().copyrightHeader.join('\n');
            saveAs(new Blob([header + '\n\n' + formattedModel], {type: 'text/turtle;charset=utf-8'}), fileName);
          }),
        );
      }),
      catchError(error => {
        this.logService.logError(`Error while exporting the Aspect Model. ${JSON.stringify(error)}.`);
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
    this.saveAspectModelToWorkspace().pipe(first()).subscribe();
  }

  saveAspectModelToWorkspace(): Observable<any> {
    let modelState: ModelLoaderState;
    let namespaces: string[];
    let isOverwrite: boolean;
    let isChangeFileName: boolean;
    let isChangeNamespace: boolean;

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.modelApiService.getNamespacesAppendWithFiles()),
      tap(targetNamespaces => (namespaces = targetNamespaces)),
      switchMap(() => this.getModelLoaderState()),
      tap(state => (modelState = state)),
      switchMap(() => this.openConfirmDialog(namespaces)),
      tap(overwrite => (isOverwrite = overwrite)),
      filter(overwrite => overwrite !== false),
      switchMap(() => (modelState.isNamespaceChanged ? this.handleNamespaceChange(modelState) : of(null))),
      map(() => {
        isChangeFileName = modelState.loadedFromWorkspace && modelState.isNameChanged && isOverwrite === null;
        isChangeNamespace = modelState.loadedFromWorkspace && modelState.isNamespaceChanged;
        return isChangeFileName || isChangeNamespace;
      }),
      switchMap(isWorkspaceChange => (isWorkspaceChange ? this.deleteModel(modelState.originalModelName) : of(null))),
      switchMap(() => this.editorService.saveModel()),
      tap(rdfModel => {
        if (rdfModel instanceof RdfModel) {
          this.namespaceCacheService.currentCachedFile.fileName = rdfModel.aspectModelFileName;
        }

        if (isChangeFileName) {
          this.notificationsService.info({
            title: this.translate.language.NOTIFICATION_SERVICE.RENAMED_FILE_TITLE,
            message: this.translate.translateService.instant('NOTIFICATION_SERVICE.RENAMED_FILE_MESSAGE', {
              oldFile: modelState.oldFileName,
              newFile: modelState.newFileName,
            }),
          });
        }

        this.rdfService.currentRdfModel.originalAbsoluteFileName = null;
        this.rdfService.currentRdfModel.loadedFromWorkspace = true;

        this.electronSignalsService.call('updateWindowInfo', {
          namespace: RdfModelUtil.getNamespaceFromRdf(modelState.newModelName),
          fromWorkspace: true,
          file: modelState.newFileName,
        });
      }),
      finalize(() => {
        this.modelSaveTracker.updateSavedModel();
        this.loadingScreenService.close();
      }),
    );
  }

  private getModelLoaderState(): Observable<ModelLoaderState> {
    const rdfModel = this.rdfService.currentRdfModel;
    const response: ModelLoaderState = {
      originalModelName: rdfModel.originalAbsoluteFileName,
      newModelName: rdfModel.absoluteAspectModelFileName,
      oldFileName: rdfModel.originalAbsoluteFileName?.split(':')?.pop(),
      newFileName: rdfModel.absoluteAspectModelFileName?.split(':')?.pop(),
      loadedFromWorkspace: rdfModel.loadedFromWorkspace,
      isNameChanged: rdfModel.originalAbsoluteFileName && rdfModel.originalAbsoluteFileName !== rdfModel.absoluteAspectModelFileName,
      isNamespaceChanged: rdfModel.isNamespaceChanged,
    };
    return of(response);
  }

  private openConfirmDialog(namespaces: string[]) {
    const rdfModel = this.modelService.currentRdfModel;

    if (namespaces.some(namespace => namespace === rdfModel.absoluteAspectModelFileName)) {
      return this.confirmDialogService.open({
        phrases: [
          this.translate.translateService.instant('CONFIRM_DIALOG.UPDATE_ASPECT_MODEL.PHRASE1', {
            fileName: rdfModel.absoluteAspectModelFileName,
          }),
          this.translate.language.CONFIRM_DIALOG.UPDATE_ASPECT_MODEL.PHRASE2,
        ],
        title: this.translate.language.CONFIRM_DIALOG.UPDATE_ASPECT_MODEL.TITLE,
        okButtonText: this.translate.language.CONFIRM_DIALOG.UPDATE_ASPECT_MODEL.OK_BUTTON,
      });
    }

    return of(null);
  }

  onAddFileToNamespace(fileInfo?: FileInfo): void {
    this.resolveModelFileContent(fileInfo)
      .pipe(
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
    return this.addFileToWorkspace(fileInfo.path, fileInfo.content, {showNotifications: true}).pipe(
      map(() => this.electronSignalsService.call('requestRefreshWorkspaces')),
    );
  }

  selectFile(): Observable<FileInfoParsed> {
    return this.fileUploadService.selectFile([FileTypes.TTL]).pipe(
      switchMap((file: File) =>
        forkJoin({
          content: readFile(file),
          path: of(file.path),
          name: of(file.path.split('/').pop()),
        }),
      ),
    );
  }

  importFilesToWorkspace(
    files: string[],
    conflictFiles: {
      replace: string[];
      keep: string[];
    },
    showLoading = true,
  ): Observable<RdfModel[]> {
    const loadingOptions: LoadingScreenOptions = {
      title: this.translate.language.LOADING_SCREEN_DIALOG.WORKSPACE_IMPORT,
      hasCloseButton: false,
    };
    if (showLoading) this.loadingScreenService.open(loadingOptions);

    const filesReplacement = this.getFilesReplacement(files, conflictFiles);

    return this.importFiles(filesReplacement).pipe(
      tap(() => this.notificationsService.success({title: this.translate.language.NOTIFICATION_SERVICE.PACKAGE_IMPORTED_SUCCESS})),
      catchError(httpError => {
        // @TODO: Temporary check until file blockage is fixed
        !httpError.error?.error?.message?.includes('packages-to-import')
          ? this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.PACKAGE_IMPORTED_ERROR})
          : this.notificationsService.success({title: this.translate.language.NOTIFICATION_SERVICE.PACKAGE_IMPORTED_SUCCESS});

        return of(null);
      }),
      finalize(() => (showLoading ? this.loadingScreenService.close() : null)),
    );
  }

  addFileToWorkspace(fileName: string, fileContent: string, uploadOptions: FileUploadOptions = {}): Observable<RdfModel> {
    const loadingOptions: LoadingScreenOptions = {
      title: this.translate.language.LOADING_SCREEN_DIALOG.WORKSPACE_IMPORT,
      hasCloseButton: false,
    };
    if (uploadOptions.showLoading) this.loadingScreenService.open(loadingOptions);

    const migratedFile = this.migratorService.bammToSamm(fileContent);
    let newModelContent: string;
    let newModelAbsoluteFileName: string;

    return this.modelApiService.formatModel(migratedFile).pipe(
      switchMap(formattedModel => {
        newModelContent = formattedModel;
        return this.modelApiService.validate(migratedFile, false);
      }),
      switchMap(validations => {
        const found = validations.find(({errorCode}) => errorCode === 'ERR_PROCESSING');
        return found
          ? throwError(() => found.message)
          : this.rdfService.loadExternalReferenceModelIntoStore({
              fileName,
              aspectMetaModel: newModelContent,
            });
      }),
      tap(({absoluteAspectModelFileName}) => (newModelAbsoluteFileName = absoluteAspectModelFileName)),
      switchMap(() => this.modelApiService.saveModel(newModelContent, newModelAbsoluteFileName)),
      tap(() => {
        if (uploadOptions.showNotifications) {
          this.notificationsService.success({
            title: this.translate.language.NOTIFICATION_SERVICE.FILE_ADDED_SUCCESS_TITLE,
            message: this.translate.language.NOTIFICATION_SERVICE.FILE_ADDED_SUCCESS_MESSAGE,
          });
        }
        this.sidebarService.workspace.refresh();
      }),
      switchMap(() => this.editorService.handleFileVersionConflicts(newModelAbsoluteFileName, newModelContent)),
      catchError(error => {
        this.logService.logError(`'Error adding file to namespaces. ${JSON.stringify(error)}.`);
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

  onValidateFile() {
    const subscription$ = this.modelService
      .synchronizeModelToRdf()
      .pipe(finalize(() => subscription$.unsubscribe()))
      .subscribe((): void => {
        if (!this.namespaceCacheService.currentCachedFile.hasCachedElements()) {
          this.notificationsService.info({
            title: this.translate.language.NOTIFICATION_DIALOG.NO_ASPECT_TITLE,
            timeout: 5000,
          });
          return;
        }
        this.validateFile().pipe(first()).subscribe();
      });
  }

  validateFile(callback?: Function) {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.NOTIFICATION_DIALOG.VALIDATING,
      content: this.translate.language.NOTIFICATION_DIALOG.CONTENT,
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
        this.logService.logError(`Error occurred while validating the current model (${JSON.stringify(error)})`);
        return throwError(() => 'Validation completed with errors');
      }),
      finalize(() => localStorage.removeItem('validating')),
    );
  }

  private importFiles(filesReplacement: {namespace: string; files: string[]}[]): Observable<RdfModel[]> {
    return this.modelApiService.replaceFiles(filesReplacement).pipe(
      map(() => {
        const requests: Observable<RdfModel>[] = [];

        filesReplacement.forEach(entry =>
          entry.files.forEach(file => {
            const fileName = `${entry.namespace}:${file}`;
            requests.push(this.importFile(fileName));
          }),
        );

        return requests;
      }),
      switchMap(requests => forkJoin(requests)),
    );
  }

  private importFile(fileName: string): Observable<RdfModel> {
    return this.modelApiService
      .getAspectMetaModel(fileName)
      .pipe(switchMap(formattedContent => this.addFileToWorkspace(fileName, formattedContent)));
  }

  private getFilesReplacement(
    files: string[],
    {keep, replace}: {replace: string[]; keep: string[]},
  ): {namespace: string; files: string[]}[] {
    // Should "keep" files be excluded?
    return Array.from(new Set([...keep, ...replace])).map(namespace => ({
      namespace,
      files: files.filter(file => file.startsWith(namespace)).map(file => file.replace(`${namespace}:`, '')),
    }));
  }

  private handleNamespaceChange(modelState: ModelLoaderState): Observable<RdfModel[]> {
    const confirmationDialogConfig: DialogOptions = {
      phrases: [
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE1', {
          originalModelName: modelState.originalModelName,
        }),
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE2', {
          originalModelName: RdfModelUtil.getFileNameFromRdf(modelState.originalModelName),
          originalModelNamespace: RdfModelUtil.getNamespaceFromRdf(modelState.originalModelName),
          newNamespace: RdfModelUtil.getNamespaceFromRdf(modelState.newModelName),
        }),
        this.translate.translateService.instant('CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE3', {
          originalModelName: RdfModelUtil.getFileNameFromRdf(modelState.originalModelName),
        }),
        this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.PHRASE4,
      ],
      title: this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.TITLE,
      okButtonText: this.translate.language.CONFIRM_DIALOG.NAMESPACE_CHANGE.OK_BUTTON,
    };

    const loadingDialogConfig: LoadingScreenOptions = {
      hasCloseButton: true,
      title: this.translate.language.LOADING_SCREEN_DIALOG.SAVING_TO_WORKSPACE_TITLE,
      content: this.translate.language.LOADING_SCREEN_DIALOG.SAVING_TO_WORKSPACE_CONTENT,
    };

    return this.confirmDialogService.open(confirmationDialogConfig).pipe(
      filter(overwrite => overwrite),
      tap(() => this.loadingScreenService.open(loadingDialogConfig)),
      switchMap(() => this.migrateAffectedModels(modelState.originalModelName, modelState.newModelName)),
    );
  }

  private migrateAffectedModels(originalModelName: string, newModelName: string): Observable<RdfModel[]> {
    const originalNamespace = RdfModelUtil.getUrnFromFileName(originalModelName);
    const newNamespace = RdfModelUtil.getUrnFromFileName(newModelName);
    const affectedModels = this.updateAffectedQuads(originalNamespace, newNamespace);
    return this.updateAffectedModels(affectedModels, originalNamespace, newNamespace);
  }

  public updateAffectedQuads(originalNamespace: string, newNamespace: string): RdfModel[] {
    const subjects = this.rdfService.currentRdfModel.store.getSubjects(null, null, null);
    const models = this.rdfService.externalRdfModels;
    const affectedModels: RdfModel[] = [];

    subjects.forEach(subject => {
      if (subject instanceof BlankNode) return;
      if (!subject.value.startsWith(newNamespace)) return;
      const subjectName = subject.value.split('#').pop();
      const originalSubject = new NamedNode(`${originalNamespace}#${subjectName}`);

      models.forEach(model => {
        const updatedPredicateQuadsCount = model.updateQuads({predicate: originalSubject}, {predicate: subject});
        const updatedObjectQuadsCount = model.updateQuads({object: originalSubject}, {object: subject});
        if (updatedPredicateQuadsCount || updatedObjectQuadsCount) affectedModels.push(model);
      });
    });

    return affectedModels;
  }

  private updateAffectedModels(models: RdfModel[], originalNamespace: string, newNamespace: string): Observable<RdfModel[]> {
    const requests = models.map(model => {
      const alias = model.getAliasByNamespace(`${originalNamespace}#`);
      alias ? model.updatePrefix(alias, originalNamespace, newNamespace) : model.addPrefix('ext-namespace', `${newNamespace}#`);
      return this.rdfService.saveModel(model);
    });

    return requests.length ? forkJoin(requests) : of([]);
  }

  private deleteModel(modelName: string): Observable<any> {
    return this.modelApiService.deleteFile(modelName).pipe(tap(() => this.rdfService.removeExternalRdfModel(modelName)));
  }
}
