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
import {EditorService} from '@ame/editor';
import {MatDialog} from '@angular/material/dialog';
import {finalize, first, switchMap} from 'rxjs/operators';
import {LoadingScreenOptions, LoadingScreenService, LogService, NotificationsService} from '@ame/shared';
import {ModelService} from '@ame/rdf/services';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {PreviewDialogComponent} from '../../preview-dialog';

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
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService
  ) {}

  generateOpenApiSpec(): Observable<any> {
    if (!this.modelService.getLoadedAspectModel().rdfModel) {
      return throwError(() => {
        this.logService.logError(this.noRdfModelAvailable);
        return this.noRdfModelAvailable;
      });
    }

    return of();
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
      switchMap(() => this.editorService.downloadJsonSample(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
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
          JSON.stringify(data, null, 2),
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
      switchMap(() => this.editorService.downloadJsonSchema(this.modelService.getLoadedAspectModel().rdfModel).pipe(first())),
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
          JSON.stringify(data, null, 2),
          `${this.modelService.getLoadedAspectModel().aspect.name}-schema.json`
        );
      }),
      finalize(() => this.loadingScreenService.close())
    );
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
