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
import {EditorService, GenerateOpenApiComponent, OpenApi} from '@ame/editor';
import {MatDialog} from '@angular/material/dialog';
import {finalize, first, switchMap} from 'rxjs/operators';
import {LoadingScreenOptions, LoadingScreenService, LogService, NotificationsService} from '@ame/shared';
import {ModelService, RdfService} from '@ame/rdf/services';
import {catchError, map, Observable, throwError} from 'rxjs';
import {PreviewDialogComponent} from '../../preview-dialog';
import {saveAs} from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class GenerateHandlingService {
  private readonly noRdfModelAvailable = 'No Rdf model available.';

  constructor(
    private logService: LogService,
    private matDialog: MatDialog,
    private editorService: EditorService,
    private modelService: ModelService,
    private rdfService: RdfService,
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService
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
        map(openApi => this.generateOpenApiSpec(loadingScreenOptions, openApi).subscribe())
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
            `${this.modelService.getLoadedAspectModel().aspect.name}-open-api.json`
          );
        }
      }),
      finalize(() => this.loadingScreenService.close())
    );
  }

  generateDocumentation(loadingScreenOptions: LoadingScreenOptions): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError(this.noRdfModelAvailable);
        return this.noRdfModelAvailable;
      });
    }

    this.loadingScreenService.open(loadingScreenOptions);
    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.editorService.openDocumentation(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
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
          `${this.modelService.getLoadedAspectModel().aspect.name}-sample.json`
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

    this.loadingScreenService.open(loadingScreenOptions);
    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(() => this.editorService.generateJsonSchema(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
      catchError(() => {
        this.notificationsService.error({
          title: 'Failed to generate JSON Schema',
          message: 'Invalid Aspect Model',
          timeout: 5000,
        });
        return throwError(() => 'Failed to generate JSON Schema');
      }),
      map(data => {
        this.openPreview(
          'JSON Schema preview',
          this.formatStringToJson(data),
          `${this.modelService.getLoadedAspectModel().aspect.name}-schema.json`
        );
      }),
      finalize(() => this.loadingScreenService.close())
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
    this.matDialog.open(PreviewDialogComponent, config);
  }
}
