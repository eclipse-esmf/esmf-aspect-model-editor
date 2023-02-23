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
import {
  EditorService,
  GenerateDocumentationComponent,
  GenerateOpenApiComponent,
  LanguageSelectorModalComponent,
  OpenApi,
} from '@ame/editor';
import {MatDialog} from '@angular/material/dialog';
import {finalize, first, switchMap} from 'rxjs/operators';
import {LoadingScreenOptions, LoadingScreenService, LogService, NotificationsService} from '@ame/shared';
import {ModelService} from '@ame/rdf/services';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {PreviewDialogComponent} from '../../preview-dialog';
import {saveAs} from 'file-saver';
import {ModelApiService} from '@ame/api';
import {NamespacesCacheService} from '@ame/cache';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GenerateHandlingService {
  private readonly noRdfModelAvailable = 'No Rdf model available.';
  private get currentCachedFile() {
    return this.namespaceCacheService.getCurrentCachedFile();
  }

  constructor(
    private logService: LogService,
    private matDialog: MatDialog,
    private editorService: EditorService,
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService,
    private namespaceCacheService: NamespacesCacheService
  ) {}

  openGenerationOpenApiSpec(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError(this.noRdfModelAvailable);
        return this.noRdfModelAvailable;
      });
    }

    return this.matDialog
      .open(GenerateOpenApiComponent, {disableClose: true})
      .afterClosed()
      .pipe(
        first(),
        map(openApi => (openApi ? this.generateOpenApiSpec(loadingScreenOptions, openApi).subscribe() : of({})))
      );
  }

  generateOpenApiSpec(loadingScreenOptions: LoadingScreenOptions, openApi: OpenApi): Observable<any> {
    this.loadingScreenService.open(loadingScreenOptions);

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.editorService.generateOpenApiSpec(this.modelService.getLoadedAspectModel().rdfModel, openApi).pipe(first())),
      catchError(() => {
        this.notificationsService.error({
          title: 'Failed to generate Open Api specification',
          message: 'Invalid Aspect Model',
          timeout: 5000,
        });
        return throwError(() => 'Failed to generate Open Api specification');
      }),
      map(data => {
        if (openApi.output === 'yaml') {
          saveAs(
            new Blob([data], {
              type: 'text/yaml',
            }),
            `${this.modelService.getLoadedAspectModel().aspect.name}-open-api.yaml`
          );
        } else {
          saveAs(
            new Blob([this.formatStringToJson(data)], {
              type: 'application/json;charset=utf-8',
            }),
            !this.modelService.getLoadedAspectModel().aspect
              ? this.currentCachedFile.fileName
              : `${this.modelService.getLoadedAspectModel().aspect.name}-open-api.json`
          );
        }
      }),
      finalize(() => this.loadingScreenService.close())
    );
  }

  openGenerationDocumentation(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError(this.noRdfModelAvailable);
        return this.noRdfModelAvailable;
      });
    }

    return this.matDialog
      .open(GenerateDocumentationComponent, {disableClose: true})
      .afterClosed()
      .pipe(
        first(),
        map((result: {language: string; action: string}) => {
          if (result.action === 'download') {
            return this.downloadDocumentation(result.language, loadingScreenOptions).subscribe({
              error: error => this.notificationsService.error({title: error}),
            });
          }

          if (result.action === 'open') {
            return this.generateDocumentation(result.language, loadingScreenOptions).subscribe({
              error: error => this.notificationsService.error({title: error}),
            });
          }

          return of({});
        })
      );
  }

  downloadDocumentation(language: string, loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    this.loadingScreenService.open(loadingScreenOptions);
    return this.modelService.synchronizeModelToRdf().pipe(
      first(),
      switchMap(() =>
        this.modelApiService.downloadDocumentation(this.editorService.getSerializedModel(), language).pipe(
          first(),
          map(data =>
            saveAs(
              new Blob([data], {
                type: 'text/html',
              }),
              !this.modelService.getLoadedAspectModel().aspect
                ? this.currentCachedFile.fileName
                : `${this.modelService.getLoadedAspectModel().aspect.name}-documentation.html`
            )
          ),
          catchError(response => {
            if (response instanceof HttpErrorResponse) {
              if (response.status === 422) {
                return throwError(() => JSON.parse(response.error).error.message.split(': ')[1]);
              } else if (response.status === 400) {
                // TODO This should be removed as soon as the SDK has fixed the graphviz error.
                return throwError(() => JSON.parse(response.error).error.message);
              }
            }
            return throwError(() => 'Server error');
          })
        )
      ),
      finalize(() => this.loadingScreenService.close())
    );
  }

  generateDocumentation(language: string, loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    this.loadingScreenService.open(loadingScreenOptions);
    return this.modelService.synchronizeModelToRdf().pipe(
      first(),
      switchMap(() => this.modelApiService.openDocumentation(this.editorService.getSerializedModel(), language).pipe(first())),
      finalize(() => this.loadingScreenService.close())
    );
  }

  generateJsonSample(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError(this.noRdfModelAvailable);
        return this.noRdfModelAvailable;
      });
    }

    this.loadingScreenService.open(loadingScreenOptions);
    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.editorService.generateJsonSample(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
      catchError(() => {
        this.notificationsService.error({
          title: 'Failed to generate JSON Sample',
          message: 'Invalid Aspect Model',
          timeout: 5000,
        });
        return throwError(() => 'Failed to generate JSON Sample');
      }),
      map(data => {
        this.openPreview(
          'Sample JSON Payload preview',
          this.formatStringToJson(data),
          !this.modelService.getLoadedAspectModel().aspect
            ? this.currentCachedFile.fileName
            : `${this.modelService.getLoadedAspectModel().aspect.name}-sample.json`
        );
      }),
      finalize(() => this.loadingScreenService.close())
    );
  }

  generateJsonSchema(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError(this.noRdfModelAvailable);
        return this.noRdfModelAvailable;
      });
    }

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.openLanguageSelector()),
      switchMap((language: string) => {
        this.loadingScreenService.open(loadingScreenOptions);
        return this.editorService.generateJsonSchema(this.modelService.getLoadedAspectModel().rdfModel, language).pipe(first());
      }),
      catchError(() => {
        this.notificationsService.error({
          title: 'Failed to generate JSON Schema',
          message: 'Invalid Aspect Model',
          timeout: 5000,
        });
        return throwError(() => 'Failed to generate JSON Schema');
      }),
      map(data => {
        this.loadingScreenService.close();
        this.openPreview(
          'JSON Schema preview',
          this.formatStringToJson(data),
          !this.modelService.getLoadedAspectModel().aspect
            ? this.currentCachedFile.fileName
            : `${this.modelService.getLoadedAspectModel().aspect.name}-schema.json`
        );
      })
    );
  }

  private formatStringToJson(data: string): string {
    return JSON.stringify(data, null, 2);
  }

  private openPreview(title: string, content: string, fileName: string) {
    const config = {
      data: {
        title: title,
        content: content,
        fileName: fileName,
      },
    };
    return this.matDialog.open(PreviewDialogComponent, config).afterClosed();
  }

  private openLanguageSelector() {
    return this.matDialog.open(LanguageSelectorModalComponent).afterClosed();
  }
}
