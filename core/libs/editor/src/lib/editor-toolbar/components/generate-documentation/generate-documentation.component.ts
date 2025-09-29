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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component, DestroyRef, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {Observable, map, throwError} from 'rxjs';
import {catchError, finalize, first} from 'rxjs/operators';
import {EditorService} from '../../../editor.service';

import {BrowserService} from '@ame/shared';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'ame-generate-documentation',
  templateUrl: './generate-documentation.component.html',
  styleUrls: ['./generate-documentation.component.scss'],
  imports: [
    MatDialogModule,
    TranslatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIcon,
  ],
})
export class GenerateDocumentationComponent {
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<GenerateDocumentationComponent>);
  private languageService = inject(SammLanguageSettingsService);
  private modelApiService = inject(ModelApiService);
  private editorService = inject(EditorService);
  private loadedFiles = inject(LoadedFilesService);

  private browserService = inject(BrowserService);

  public languages: locale.ILocale[] = [];
  public languageControl: FormControl;
  public isGenerating = false;

  private get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  constructor() {
    this.languages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languageControl = new FormControl(this.languages[0].tag);
  }

  openDocumentation(): void {
    this.isGenerating = true;

    this.generateDocumentation(this.editorService.getSerializedModel(), this.languageControl.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        finalize(() => {
          this.isGenerating = false;
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  downloadDocumentation(): void {
    this.isGenerating = true;

    this.modelApiService
      .generateDocumentation(this.editorService.getSerializedModel(), this.languageControl.value)
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
          this.isGenerating = false;
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  private generateDocumentation(rdfContent: string, language: string): Observable<void> {
    return this.modelApiService.generateDocumentation(rdfContent, language).pipe(
      map((documentation: string) => {
        if (!this.browserService.isStartedAsElectronApp()) {
          const tabRef = window.open('about:blank', '_blank');
          tabRef.document.write(documentation);
          tabRef.focus();
          tabRef.document.close();
          return;
        }

        const fs = window.require('fs');
        const os = window.require('os');
        const path = window.require('path');
        const ameTmpDir = path.join(os.homedir(), '.ametmp');
        const printFilePath = path.normalize(path.join(ameTmpDir, 'print.html'));
        const BrowserWindow = window.require('@electron/remote').BrowserWindow;
        const electronBrowserWindow = new BrowserWindow({
          width: 1920,
          height: 1080,
        });

        if (!fs.existsSync(ameTmpDir)) {
          fs.mkdirSync(ameTmpDir);
        }

        fs.writeFile(printFilePath, documentation, err => {
          if (err) {
            console.error('Write error:  ' + err.message);
          } else {
            electronBrowserWindow.loadFile(printFilePath);
            electronBrowserWindow.reload();
            electronBrowserWindow.focus();
          }
        });
      }),
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
      }),
    );
  }
}
