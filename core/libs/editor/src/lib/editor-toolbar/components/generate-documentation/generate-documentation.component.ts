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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component, DestroyRef, inject, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TranslocoDirective} from '@jsverse/transloco';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {from, map, Observable, throwError} from 'rxjs';
import {catchError, finalize, first} from 'rxjs/operators';
import {EditorService} from '../../../editor.service';

import {BrowserService, IPC_RENDERER} from '@ame/shared';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';

export interface GenerateDocumentationData {
  language: string;
}

@Component({
  selector: 'ame-generate-documentation',
  templateUrl: './generate-documentation.component.html',
  styleUrls: ['./generate-documentation.component.scss'],
  imports: [
    MatDialogModule,
    TranslocoDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    FormField,
    MatButtonModule,
    MatIcon,
  ],
})
export class GenerateDocumentationComponent {
  private ipcRenderer = inject(IPC_RENDERER);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<GenerateDocumentationComponent>);
  private languageService = inject(SammLanguageSettingsService);
  private modelApiService = inject(ModelApiService);
  private editorService = inject(EditorService);
  private loadedFiles = inject(LoadedFilesService);

  private browserService = inject(BrowserService);

  public docModel = signal<GenerateDocumentationData>({language: ''});
  public docForm = form(this.docModel);
  public languages = signal<locale.ILocale[]>([]);
  public isGenerating = signal(false);

  private get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  constructor() {
    const sammLanguages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languages.set(sammLanguages);
    if (sammLanguages.length > 0) {
      this.docModel.set({language: sammLanguages[0].tag});
    }
  }

  openDocumentation(): void {
    this.isGenerating.set(true);

    this.generateDocumentation(this.editorService.getSerializedModel(), this.docModel().language)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        finalize(() => {
          this.isGenerating.set(false);
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  downloadDocumentation(): void {
    this.isGenerating.set(true);

    this.modelApiService
      .generateDocumentation(
        this.editorService.getSerializedModel(),
        this.docModel().language,
        this.loadedFiles.currentLoadedFile.rdfModel.getSourceLocation(),
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        map(data =>
          saveAs(
            new Blob([data], {
              type: 'text/html',
            }),
            !this.loadedFiles.currentLoadedFile?.aspect
              ? this.currentFile.name
              : `${this.loadedFiles.currentLoadedFile?.aspect.name}-documentation.html`,
          ),
        ),
        finalize(() => {
          this.isGenerating.set(false);
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  private generateDocumentation(rdfContent: string, language: string): Observable<void> {
    return this.modelApiService
      .generateDocumentation(rdfContent, language, this.loadedFiles.currentLoadedFile.rdfModel.getSourceLocation())
      .pipe(
        map((documentation: string) => {
          if (!this.browserService.isStartedAsElectronApp()) {
            return;
          }

          from(
            this.ipcRenderer
              .writePrintFile(documentation)
              .then((printFilePath: string) => this.ipcRenderer.openPrintWindow(printFilePath))
              .catch((err: any) => console.error('Print error:', err)),
          );
        }),
        catchError(response => {
          if (response instanceof HttpErrorResponse) {
            if (response.status === 422) {
              return throwError(() => JSON.parse(response.error).error.message.split(': ')[1]);
            }
          }
          return throwError(() => 'Server error');
        }),
      );
  }
}
