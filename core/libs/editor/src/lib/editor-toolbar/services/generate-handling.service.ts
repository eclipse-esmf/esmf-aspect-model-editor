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

import {LoadedFilesService} from '@ame/cache';
import {
  AASXGenerationModalComponent,
  EditorService,
  FileHandlingService,
  GenerateAsyncApiComponent,
  GenerateDocumentationComponent,
  GenerateOpenApiComponent,
  LanguageSelectorModalComponent,
} from '@ame/editor';
import {ModelService} from '@ame/rdf/services';
import {LoadingScreenOptions, LoadingScreenService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable, catchError, map, switchMap, throwError} from 'rxjs';
import {finalize, first} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {PreviewDialogComponent} from '../../preview-dialog';

@Injectable({
  providedIn: 'root',
})
export class GenerateHandlingService {
  private get currentCachedFile() {
    return this.currentFile.cachedFile;
  }

  private get currentFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor(
    private matDialog: MatDialog,
    private editorService: EditorService,
    private modelService: ModelService,
    private notificationsService: NotificationsService,
    private loadingScreenService: LoadingScreenService,
    private translate: LanguageTranslationService,
    private fileHandlingService: FileHandlingService,
    private loadedFilesService: LoadedFilesService,
  ) {
    if (!environment.production) {
      window['angular.generateHandlingService'] = this;
    }
  }

  onGenerateOpenApiSpec() {
    const cb = () => this.openGenerationOpenApiSpec();
    this.validateFile(cb);
  }

  openGenerationOpenApiSpec(): MatDialogRef<GenerateOpenApiComponent> {
    return this.matDialog.open(GenerateOpenApiComponent, {disableClose: true});
  }

  onGenerateAsyncApiSpec() {
    const cb = () => this.openGenerationAsyncApiSpec();
    this.validateFile(cb);
  }

  openGenerationAsyncApiSpec(): MatDialogRef<GenerateAsyncApiComponent> {
    return this.matDialog.open(GenerateAsyncApiComponent, {disableClose: true});
  }

  onGenerateDocumentation() {
    const cb = () => this.openGenerationDocumentation();
    this.validateFile(cb);
  }

  openGenerationDocumentation(): MatDialogRef<GenerateDocumentationComponent> {
    return this.matDialog.open(GenerateDocumentationComponent, {disableClose: true});
  }

  onGenerateAASXFile() {
    const cb = () => this.matDialog.open(AASXGenerationModalComponent, {disableClose: true});
    this.validateFile(cb);
  }

  onGenerateJsonSample() {
    const cb = () => this.generateJsonSample().pipe(first()).subscribe();
    this.validateFile(cb);
  }

  generateJsonSample(): Observable<any> {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.NOTIFICATION_DIALOG?.GENERATE_JSON_PAYLOAD,
      content: this.translate.language.NOTIFICATION_DIALOG?.CONTENT,
      hasCloseButton: true,
    };

    this.loadingScreenService.open(loadingScreenOptions);
    return this.editorService.generateJsonSample(this.loadedFilesService.currentLoadedFile?.rdfModel).pipe(
      first(),
      catchError(() => {
        this.notificationsService.error({
          title: this.translate.language.GENERATE_HANDLING.FAIL_GENERATE_JSON_SAMPLE,
          message: this.translate.language.GENERATE_HANDLING.INVALID_MODEL,
          timeout: 5000,
        });
        return throwError(() => this.translate.language.GENERATE_HANDLING.FAIL_GENERATE_JSON_SAMPLE);
      }),
      map(data => {
        this.openPreview(
          this.translate.language.GENERATE_HANDLING.JSON_PAYLOAD_PREVIEW,
          this.formatStringToJson(data),
          !this.loadedFilesService?.currentLoadedFile?.aspect
            ? this.currentFile.name
            : `${this.loadedFilesService?.currentLoadedFile?.aspect.name}-sample.json`,
        );
      }),
      finalize(() => this.loadingScreenService.close()),
    );
  }

  onGenerateJsonSchema() {
    const cb = () => this.generateJsonSchema().pipe(first()).subscribe();
    this.validateFile(cb);
  }

  generateJsonSchema(): Observable<void> {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.NOTIFICATION_DIALOG?.GENERATE_JSON_SCHEMA,
      content: this.translate.language.NOTIFICATION_DIALOG?.CONTENT,
      hasCloseButton: true,
    };

    this.loadingScreenService.open(loadingScreenOptions);

    return this.matDialog
      .open(LanguageSelectorModalComponent)
      .afterClosed()
      .pipe(
        first(),
        switchMap((language: string) =>
          this.editorService.generateJsonSchema(this.loadedFilesService.currentLoadedFile?.rdfModel, language).pipe(
            first(),
            catchError(() => {
              this.notificationsService.error({
                title: this.translate.language.GENERATE_HANDLING.FAIL_GENERATE_JSON_SCHEMA,
                message: this.translate.language.GENERATE_HANDLING.INVALID_MODEL,
                timeout: 5000,
              });
              return throwError(() => this.translate.language.GENERATE_HANDLING.FAIL_GENERATE_JSON_SCHEMA);
            }),
            map(data => {
              this.loadingScreenService.close();
              this.openPreview(
                this.translate.language.GENERATE_HANDLING.JSON_SCHEMA_PREVIEW,
                this.formatStringToJson(data),
                !this.loadedFilesService?.currentLoadedFile?.aspect
                  ? this.currentFile.name
                  : `${this.loadedFilesService?.currentLoadedFile?.aspect.name}-schema.json`,
              );
            }),
          ),
        ),
      );
  }

  validateFile(callback?: Function): void {
    const subscription$ = this.modelService
      .synchronizeModelToRdf()
      .pipe(finalize(() => subscription$.unsubscribe()))
      .subscribe((): void => {
        if (!this.loadedFilesService?.currentLoadedFile?.aspect) {
          this.notificationsService.info({
            title: this.translate.language.GENERATE_HANDLING.NO_ASPECT_TITLE,
            timeout: 5000,
          });
          return;
        }
        this.fileHandlingService.validateFile(callback).pipe(first()).subscribe();
      });
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
}
