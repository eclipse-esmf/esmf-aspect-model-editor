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
import {ConfirmDialogService, EditorService} from '@ame/editor';
import {MatDialog} from '@angular/material/dialog';
import {LoadModelDialogComponent} from '../../load-model-dialog';
import {catchError, finalize, first, map, switchMap, tap} from 'rxjs/operators';
import {Observable, of, throwError} from 'rxjs';
import {LoadingScreenOptions, LoadingScreenService, LogService, NotificationsService, SaveValidateErrorsCodes} from '@ame/shared';
import {saveAs} from 'file-saver';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ModelApiService} from '@ame/api';
import {NamespacesCacheService} from '@ame/cache';
import {RdfModel} from '@ame/rdf/utils';
import {MigratorService} from '@ame/migrator';

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
    private migratorService: MigratorService
  ) {}

  openLoadNewAspectModelDialog(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    return this.matDialog
      .open(LoadModelDialogComponent)
      .afterClosed()
      .pipe(
        first(),
        switchMap(rdfAspectModel => {
          if (!rdfAspectModel) {
            return of(null);
          }
          this.loadingScreenService.open({...loadingScreenOptions});
          const migratedModel = this.migratorService.detectBammAndReplaceWithSamm(rdfAspectModel);
          if (migratedModel !== rdfAspectModel) {
            this.notificationsService.info({
              title: 'Model migrated from BAMM to SAMM',
            });
          }
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
            finalize(() => {
              this.loadingScreenService.close();
            })
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
            console.log(formattedModel);
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
    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.modelApiService.getNamespacesAppendWithFiles()),
      switchMap((namespaces: string[]) => this.getModelLoaderState().pipe(map(modelState => ({...modelState, namespaces})))),
      switchMap(modelState => this.openConfirmDialog(modelState.namespaces).pipe(map(overwrite => ({...modelState, overwrite})))),
      switchMap(modelState => {
        if (modelState.overwrite === false) {
          return of(null);
        }

        this.editorService.updateLastSavedRdf(false, this.rdfService.serializeModel(this.rdfService.currentRdfModel), new Date());
        const changeFileName = modelState.loadedFromWorkspace && modelState.isNameChanged && modelState.overwrite === null;

        return (changeFileName ? this.modelApiService.deleteNamespace(modelState.originalModelName) : of(null)).pipe(
          switchMap(() => this.editorService.saveModel()),
          tap(rdfModel => {
            if (rdfModel instanceof RdfModel) {
              this.namespaceCacheService.getCurrentCachedFile().fileName = rdfModel.aspectModelFileName;
            }

            if (changeFileName) {
              this.notificationsService.info({
                title: 'Model file was renamed',
                message: `File ${modelState.oldFileName} was renamed to ${modelState.newFileName}`,
              });
            }

            this.rdfService.currentRdfModel.originalAbsoluteFileName = null;
            this.rdfService.currentRdfModel.loadedFromWorkspace = true;
          })
        );
      })
    );
  }

  private getModelLoaderState() {
    const rdfModel = this.rdfService.currentRdfModel;
    const response = {
      /** Original model absolute file urn */
      originalModelName: rdfModel.originalAbsoluteFileName,
      /** New model absolute file urn */
      newModelName: rdfModel.absoluteAspectModelFileName,
      /** Original file name */
      oldFileName: rdfModel.originalAbsoluteFileName?.split(':')?.pop(),
      /** New model name got after renaming or removing the Aspect */
      newFileName: rdfModel.absoluteAspectModelFileName?.split(':')?.pop(),
      /** Boolean representing if model was loaded from workspace */
      loadedFromWorkspace: rdfModel.loadedFromWorkspace,
      /** Boolean representing if the original file name was changed */
      isNameChanged: rdfModel.originalAbsoluteFileName && rdfModel.originalAbsoluteFileName !== rdfModel.absoluteAspectModelFileName,
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

  addFileToNamespace(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.modelApiService
        .formatModel(reader.result.toString())
        .pipe(
          switchMap(formattedModel => this.modelApiService.saveModel(formattedModel)),
          catchError(error => {
            this.logService.logError(`'Error adding file to namespaces. ${JSON.stringify(error)}.`);
            this.notificationsService.error({title: 'Error adding file to namespaces'});
            return throwError(() => error);
          })
        )
        .subscribe({
          complete: () => {
            this.notificationsService.success({title: 'Successfully added file to namespaces'});
            this.editorService.refreshSidebarNamespaces();
          },
        });
    };
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
}
