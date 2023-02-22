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
import {ConfirmDialogService, EditorService, ExportWorkspaceComponent, RenameModelDialogService, ZipUploaderComponent} from '@ame/editor';
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

enum InternalErrors {
  RENAME_ABORT = 'RENAME_ABORT',
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
    private renameDialogService: RenameModelDialogService,
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService,
    private namespaceCacheService: NamespacesCacheService
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
          return this.editorService.loadNewAspectModel(rdfAspectModel, '').pipe(
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
      switchMap(() => {
        const fileName = this.modelService.getLoadedAspectModel().aspect
          ? `${this.modelService.getLoadedAspectModel().aspect?.name}.ttl`
          : this.rdfService.currentRdfModel.aspectModelFileName || 'undefined.ttl';

        if (fileName !== 'undefined.ttl') {
          return of(fileName);
        }

        return this.modelApiService
          .getNamespacesAppendWithFiles()
          .pipe(switchMap(namespaces => this.openRenameModal(namespaces).pipe(map(result => result?.name || fileName))));
      }),
      tap(fileName => {
        return saveAs(
          new Blob([this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel)], {
            type: 'text/turtle;charset=utf-8',
          }),
          fileName
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
      switchMap((namespaces: string[]) =>
        this.openRenameModal(namespaces).pipe(
          switchMap(result => (result ? of(result) : throwError(() => ({type: InternalErrors.RENAME_ABORT}))))
        )
      ),
      switchMap((result: {name: string; namespaces: string[]}) => this.openConfirmDialog(result.namespaces)),
      switchMap(() => {
        this.editorService.updateLastSavedRdf(
          false,
          this.rdfService.serializeModel(this.modelService.getLoadedAspectModel().rdfModel),
          new Date()
        );
        return this.editorService.saveModel();
      }),
      tap(rdfModel => {
        if (rdfModel instanceof RdfModel) {
          this.namespaceCacheService.getCurrentCachedFile().fileName = rdfModel.aspectModelFileName;
        }
      }),
      catchError(error => {
        if (error?.type === InternalErrors.RENAME_ABORT) {
          this.logService.logInfo('Aspect-less file: Rename abort');
        }
        return of(null);
      })
    );
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

  private openRenameModal(namespaces: string[]) {
    const currentRdfModel = this.rdfService.currentRdfModel;
    if (currentRdfModel.hasAspect || currentRdfModel.aspectModelFileName) {
      return of({namespaces});
    }

    return this.renameDialogService.open(namespaces, currentRdfModel).pipe(
      map(result => {
        if (!result) {
          return null;
        }

        currentRdfModel.aspectModelFileName = result.name;
        // Resetting absolute file name to be reconstructed on save
        currentRdfModel.absoluteAspectModelFileName = '';
        return {namespaces, ...(result || {})};
      })
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
