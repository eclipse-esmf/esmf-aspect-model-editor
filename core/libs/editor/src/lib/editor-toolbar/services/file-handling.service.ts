/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {ConfirmDialogService, EditorService, ExportWorkspaceComponent, ZipUploaderComponent} from '@ame/editor';
import {MatDialog} from '@angular/material/dialog';
import {LoadModelDialogComponent} from '../../load-model-dialog';
import {catchError, finalize, first, map, switchMap, tap} from 'rxjs/operators';
import {Observable, of, throwError} from 'rxjs';
import {LoadingScreenOptions, LoadingScreenService, LogService, NotificationsService, SaveValidateErrorsCodes} from '@ame/shared';
import {saveAs} from 'file-saver';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ModelApiService} from '@ame/api';

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
    private loadingScreenService: LoadingScreenService
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
          return this.editorService.loadNewAspectModel(rdfAspectModel).pipe(
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
      tap(() =>
        saveAs(
          new Blob([this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel)], {
            type: 'text/turtle;charset=utf-8',
          }),
          `${this.modelService.getLoadedAspectModel().aspect.name}.ttl`
        )
      ),
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
      switchMap(() =>
        this.modelApiService.getNamespacesAppendWithFiles().pipe(
          first(),
          map((namespaces: string[]) => {
            const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
            const serializeModel = this.rdfService.serializeModel(rdfModel);

            if (namespaces.some(namespace => namespace === rdfModel.getAbsoluteAspectModelFileName())) {
              this.confirmDialogService
                .open({
                  phrases: [
                    `The Aspect model "${rdfModel.getAbsoluteAspectModelFileName()}" is already defined in your file structure.`,
                    'Are you sure you want to overwrite it?',
                  ],
                  title: 'Update Aspect model',
                  okButtonText: 'Overwrite',
                })
                .subscribe(confirmed => {
                  if (confirmed) {
                    this.editorService.updateLastSavedRdf(false, serializeModel, new Date());
                    this.editorService.saveModel().subscribe();
                  }
                });
            } else {
              this.editorService.updateLastSavedRdf(false, serializeModel, new Date());
              this.editorService.saveModel().subscribe();
            }
          })
        )
      )
    );
  }

  openExportDialog(): Observable<any> {
    return this.matDialog.open(ExportWorkspaceComponent, {disableClose: true}).afterClosed().pipe(first());
  }

  addFileToNamespace(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.modelApiService
        .saveModel(reader.result.toString())
        .pipe(
          first(),
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

  uploadZip(file: File) {
    this.matDialog.open(ZipUploaderComponent, {data: {file, name: file.name}, disableClose: true});
  }

  validateFile(loadingScreenOptions: LoadingScreenOptions, callback?: Function) {
    this.loadingScreenService.open(loadingScreenOptions);
    return this.editorService.validate().pipe(
      map(correctableErrors => {
        this.loadingScreenService.close();
        this.logService.logInfo('Validated successfully');
        if (correctableErrors?.length === 0) {
          this.notificationsService.info({title: 'Validation completed successfully', timeout: 5000});
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
