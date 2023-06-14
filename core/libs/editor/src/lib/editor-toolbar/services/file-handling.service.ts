/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {ConfirmDialogService, DialogOptions, EditorService} from '@ame/editor';
import {MatDialog} from '@angular/material/dialog';
import {LoadModelDialogComponent} from '../../load-model-dialog';
import {catchError, filter, finalize, first, map, switchMap, tap} from 'rxjs/operators';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {
  LoadingScreenOptions,
  LoadingScreenService,
  LogService,
  NotificationsService,
  SaveValidateErrorsCodes,
  SidebarService,
} from '@ame/shared';
import {saveAs} from 'file-saver';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ModelApiService} from '@ame/api';
import {NamespacesCacheService} from '@ame/cache';
import {RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {MigratorService} from '@ame/migrator';
import {BlankNode, NamedNode} from 'n3';

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
    private matDialog: MatDialog,
    private editorService: EditorService,
    private modelService: ModelService,
    private rdfService: RdfService,
    private modelApiService: ModelApiService,
    private confirmDialogService: ConfirmDialogService,
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService,
    private namespaceCacheService: NamespacesCacheService,
    private migratorService: MigratorService,
    private sidebarService: SidebarService
  ) {}

  openLoadNewAspectModelDialog(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    return this.matDialog
      .open(LoadModelDialogComponent)
      .afterClosed()
      .pipe(
        first(),
        switchMap(rdfAspectModel => {
          if (!rdfAspectModel) return of(null);

          this.loadingScreenService.open(loadingScreenOptions);
          const migratedModel = this.migratorService.bammToSamm(rdfAspectModel);
          return this.editorService.loadNewAspectModel(migratedModel, '').pipe(
            first(),
            catchError(error => {
              this.notificationsService.error({
                title: 'Error when loading Aspect Model. Reverting to previous Aspect Model',
                message: `${error}`,
                timeout: 5000,
              });
              return of(null);
            }),
            finalize(() => this.loadingScreenService.close())
          );
        })
      );
  }

  copyToClipboard() {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      this.notificationsService.error({
        title: 'No RDF Model',
        message: 'No Rdf model available.',
        timeout: 5000,
      });
      return;
    }

    navigator.clipboard.writeText(this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel)).then(() => {
      this.notificationsService.success({
        title: 'Copied to Clipboard',
        message: 'The Aspect Model has been copied to clipboard (as ttl code)',
        timeout: 5000,
      });
    });
  }

  exportAsAspectModelFile(loadingScreenOptions): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError('No Rdf model available. ');
        return 'No Rdf model available. ';
      });
    }

    this.loadingScreenService.open(loadingScreenOptions);
    return this.modelService.synchronizeModelToRdf().pipe(
      map(() => {
        return this.rdfService.currentRdfModel.aspectModelFileName || 'undefined.ttl';
      }),
      switchMap(fileName => {
        const rdfModelTtl = this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel);
        return this.modelApiService.formatModel(rdfModelTtl).pipe(
          tap(formattedModel => {
            saveAs(new Blob([formattedModel], {type: 'text/turtle;charset=utf-8'}), fileName);
          })
        );
      }),
      catchError(error => {
        this.logService.logError(`Error while exporting the Aspect Model. ${JSON.stringify(error)}.`);
        this.notificationsService.error({
          title: 'Error while exporting the Aspect Model',
          message: `${error}`,
          timeout: 5000,
        });
        return throwError(() => error);
      }),
      finalize(() => this.loadingScreenService.close())
    );
  }

  saveAspectModelToWorkspace(): Observable<any> {
    let modelState: ModelLoaderState;
    let namespaces: string[];
    let isOverwrite: boolean;
    let isChangeFileName: boolean;

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
        this.editorService.updateLastSavedRdf(false, this.rdfService.serializeModel(this.rdfService.currentRdfModel), new Date());
        isChangeFileName = modelState.loadedFromWorkspace && modelState.isNameChanged && isOverwrite === null;
        const isChangeNamespace = modelState.loadedFromWorkspace && modelState.isNamespaceChanged;
        return isChangeFileName || isChangeNamespace;
      }),
      switchMap(isWorkspaceChange => (isWorkspaceChange ? this.deleteModel(modelState.originalModelName) : of(null))),
      switchMap(() => this.editorService.saveModel()),
      tap(rdfModel => {
        if (rdfModel instanceof RdfModel) {
          this.namespaceCacheService.getCurrentCachedFile().fileName = rdfModel.aspectModelFileName;
        }

        if (isChangeFileName) {
          this.notificationsService.info({
            title: 'Model file was renamed',
            message: `File ${modelState.oldFileName} was renamed to ${modelState.newFileName}`,
          });
        }

        this.rdfService.currentRdfModel.originalAbsoluteFileName = null;
        this.rdfService.currentRdfModel.loadedFromWorkspace = true;
      }),
      finalize(() => this.loadingScreenService.close())
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
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;

    if (namespaces.some(namespace => namespace === rdfModel.absoluteAspectModelFileName)) {
      return this.confirmDialogService.open({
        phrases: [
          `The Aspect model "${rdfModel.absoluteAspectModelFileName}" is already defined in your file structure.`,
          'Are you sure you want to overwrite it?',
        ],
        title: 'Update Aspect model',
        okButtonText: 'Overwrite',
      });
    }

    return of(null);
  }

  importFilesToWorkspace(files: string[], conflictFiles: {replace: string[]; keep: string[]}, showLoading = true): Observable<RdfModel[]> {
    const loadingOptions: LoadingScreenOptions = {
      title: 'Importing files into the workspace',
      hasCloseButton: false,
    };
    if (showLoading) this.loadingScreenService.open(loadingOptions);

    const filesReplacement = this.getFilesReplacement(files, conflictFiles);

    return this.importFiles(filesReplacement).pipe(
      tap(() => this.notificationsService.success({title: `Package was imported`})),
      catchError(httpError => {
        // @TODO: Temporary check until file blockage is fixed
        !httpError.error?.error?.message?.includes('packages-to-import')
          ? this.notificationsService.error({title: `Something went wrong. Please retry to upload the namespaces`})
          : this.notificationsService.success({title: `Package was imported`});

        return of(null);
      }),
      finalize(() => (showLoading ? this.loadingScreenService.close() : null))
    );
  }

  addFileToWorkspace(fileName: string, fileContent: string, showLoading = true): Observable<RdfModel> {
    const loadingOptions: LoadingScreenOptions = {
      title: 'Importing files into the workspace',
      hasCloseButton: false,
    };
    if (showLoading) this.loadingScreenService.open(loadingOptions);

    const migratedFile = this.migratorService.bammToSamm(fileContent);
    let newModelContent: string;
    let newModelAbsoluteFileName: string;

    return this.modelApiService.formatModel(migratedFile).pipe(
      tap(formattedModel => (newModelContent = formattedModel)),
      switchMap(() =>
        this.rdfService.loadExternalReferenceModelIntoStore({
          fileName,
          aspectMetaModel: newModelContent,
        })
      ),
      tap(({absoluteAspectModelFileName}) => (newModelAbsoluteFileName = absoluteAspectModelFileName)),
      switchMap(() => this.modelApiService.saveModel(newModelContent, newModelAbsoluteFileName)),
      tap(() => {
        this.notificationsService.success({
          title: 'Successfully added file to workspace',
        });
        this.sidebarService.refreshSidebarNamespaces();
      }),
      switchMap(() => this.editorService.handleFileVersionConflicts(newModelAbsoluteFileName, newModelContent)),
      catchError(error => {
        this.logService.logError(`'Error adding file to namespaces. ${JSON.stringify(error)}.`);
        this.notificationsService.error({
          title: 'Error adding file to workspace',
        });
        return throwError(() => error);
      }),
      finalize(() => (showLoading ? this.loadingScreenService.close() : null))
    );
  }

  validateFile(loadingScreenOptions: LoadingScreenOptions, callback?: Function) {
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
          this.notificationsService.error({title: 'Validation in progress'});
          return of(() => 'Validation in progress');
        }
        this.notificationsService.error({
          title: 'Validation completed with errors',
          message: 'Unfortunately the validation could not be completed. Please retry or contact support',
          timeout: 5000,
        });
        this.logService.logError(`Error occurred while validating the current model (${error})`);
        return throwError(() => 'Validation completed with errors');
      }),
      finalize(() => localStorage.removeItem('validating'))
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
          })
        );

        return requests;
      }),
      switchMap(requests => forkJoin(requests))
    );
  }

  private importFile(fileName: string): Observable<RdfModel> {
    return this.modelApiService
      .getAspectMetaModel(fileName)
      .pipe(switchMap(formattedContent => this.addFileToWorkspace(fileName, formattedContent, false)));
  }

  private getFilesReplacement(
    files: string[],
    {keep, replace}: {replace: string[]; keep: string[]}
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
        `The namespace for "${modelState.originalModelName}" model has been changed. The process will make the following changes:`,
        `• move "${RdfModelUtil.getFileNameFromRdf(modelState.originalModelName)}" from "${RdfModelUtil.getNamespaceFromRdf(
          modelState.originalModelName
        )}" to "${RdfModelUtil.getNamespaceFromRdf(modelState.newModelName)}" namespace`,
        `• update Aspect models which depend on "${RdfModelUtil.getFileNameFromRdf(modelState.originalModelName)}" model`,
        'Are you sure you want to continue?',
      ],
      title: `Model's namespace has been changed`,
      okButtonText: 'Continue',
    };

    const loadingDialogConfig: LoadingScreenOptions = {
      hasCloseButton: true,
      title: 'Saving Aspect Model to a workspace',
      content: 'Please wait. The migration process for dependent models can take a while.',
    };

    return this.confirmDialogService.open(confirmationDialogConfig).pipe(
      filter(overwrite => overwrite),
      tap(() => this.loadingScreenService.open(loadingDialogConfig)),
      switchMap(() => this.migrateAffectedModels(modelState.originalModelName, modelState.newModelName))
    );
  }

  private migrateAffectedModels(originalModelName: string, newModelName: string): Observable<RdfModel[]> {
    const originalNamespace = RdfModelUtil.getUrnFromFileName(originalModelName);
    const newNamespace = RdfModelUtil.getUrnFromFileName(newModelName);
    const affectedModels = this.updateAffectedQuads(originalNamespace, newNamespace);
    return this.updateAffectedModels(affectedModels, originalNamespace, newNamespace);
  }

  private updateAffectedQuads(originalNamespace: string, newNamespace: string): RdfModel[] {
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
    return this.modelApiService.deleteFile(modelName).pipe(tap(() => this.rdfService.removeExternalModel(modelName)));
  }
}
