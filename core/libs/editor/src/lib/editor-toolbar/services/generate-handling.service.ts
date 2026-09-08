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

import {LoadedFilesService} from '@ame/cache';
import {ModelService} from '@ame/rdf/services';
import {LoadingScreenOptions, LoadingScreenService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {DestroyRef, inject, Injectable} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {catchError, map, Observable, switchMap, throwError} from 'rxjs';
import {finalize, first} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {EditorService} from '../../editor.service';
import {PreviewDialogComponent} from '../../preview-dialog';
import {AASXGenerationModalComponent} from '../components/aasx-generation-modal/aasx-generation-modal.component';
import {GenerateAsyncApiComponent} from '../components/generate-async-api/generate-async-api.component';
import {GenerateDocumentationComponent} from '../components/generate-documentation/generate-documentation.component';
import {GenerateOpenApiComponent} from '../components/generate-open-api/generate-open-api.component';
import {LanguageSelectorModalComponent} from '../components/language-sector-modal/language-selector-modal.component';
import {FileHandlingService} from './file-handling.service';

@Injectable({providedIn: 'root'})
export class GenerateHandlingService {
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private editorService = inject(EditorService);
  private modelService = inject(ModelService);
  private notificationsService = inject(NotificationsService);
  private loadingScreenService = inject(LoadingScreenService);
  private translate = inject(LanguageTranslationService);
  private fileHandlingService = inject(FileHandlingService);
  private loadedFilesService = inject(LoadedFilesService);

  private get currentFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  constructor() {
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
    const cb = () => this.openGenerationAASX();
    this.validateFile(cb);
  }

  openGenerationAASX(): MatDialogRef<AASXGenerationModalComponent> {
    return this.matDialog.open(AASXGenerationModalComponent, {disableClose: true});
  }

  onGenerateJsonSample() {
    const cb = () => this.generateJsonSample().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
    this.validateFile(cb);
  }

  generateJsonSample(): Observable<any> {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.notificationDialog?.GENERATE_JSON_PAYLOAD,
      content: this.translate.language.notificationDialog?.CONTENT,
      hasCloseButton: true,
    };

    this.loadingScreenService.open(loadingScreenOptions);
    return this.editorService.generateJsonSample(this.loadedFilesService.currentLoadedFile?.rdfModel).pipe(
      first(),
      catchError(() => {
        this.notificationsService.error({
          title: this.translate.language.generateHandling.failGenerateJsonSample,
          message: this.translate.language.generateHandling.invalidModel,
          timeout: 5000,
        });
        return throwError(() => this.translate.language.generateHandling.failGenerateJsonSample);
      }),
      map(data => {
        this.openPreview(
          this.translate.language.generateHandling.jsonPayloadPreview,
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
    const cb = () => this.generateJsonSchema().pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
    this.validateFile(cb);
  }

  generateJsonSchema(): Observable<void> {
    const loadingScreenOptions: LoadingScreenOptions = {
      title: this.translate.language.notificationDialog?.GENERATE_JSON_SCHEMA,
      content: this.translate.language.notificationDialog?.CONTENT,
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
                title: this.translate.language.generateHandling.failGenerateJsonSchema,
                message: this.translate.language.generateHandling.invalidModel,
                timeout: 5000,
              });
              return throwError(() => this.translate.language.generateHandling.failGenerateJsonSchema);
            }),
            map(data => {
              this.loadingScreenService.close();
              this.openPreview(
                this.translate.language.generateHandling.jsonSchemaPreview,
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  validateFile(callback?: Function): void {
    this.modelService
      .synchronizeModelToRdf()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        if (!this.loadedFilesService?.currentLoadedFile?.aspect) {
          this.notificationsService.info({
            title: this.translate.language.generateHandling.noAspectTitle,
            timeout: 5000,
          });
          return;
        }
        this.fileHandlingService.validateFile(callback).pipe(takeUntilDestroyed(this.destroyRef), first()).subscribe();
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
