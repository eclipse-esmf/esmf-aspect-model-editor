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
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LanguageTranslateModule} from '@ame/translation';
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {map} from 'rxjs';
import {finalize, first} from 'rxjs/operators';
import {EditorService} from '../../../editor.service';

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
    LanguageTranslateModule,
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
  languages: locale.ILocale[] = [];
  languageControl: FormControl;
  isGenerating = false;

  private get currentFile() {
    return this.loadedFiles.currentLoadedFile;
  }

  constructor(
    private dialogRef: MatDialogRef<GenerateDocumentationComponent>,
    private languageService: SammLanguageSettingsService,
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private editorService: EditorService,
    private loadedFiles: LoadedFilesService,
  ) {
    this.languages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languageControl = new FormControl(this.languages[0].tag);
  }

  openDocumentation(): void {
    this.isGenerating = true;

    this.modelApiService
      .openDocumentation(this.editorService.getSerializedModel(), this.languageControl.value)
      .pipe(
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
      .downloadDocumentation(this.editorService.getSerializedModel(), this.languageControl.value)
      .pipe(
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
}
