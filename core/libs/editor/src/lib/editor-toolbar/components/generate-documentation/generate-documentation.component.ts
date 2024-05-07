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

import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import * as locale from 'locale-codes';
import {finalize, first} from 'rxjs/operators';
import {ModelApiService} from '@ame/api';
import {EditorService} from '../../../editor.service';
import {map} from 'rxjs';
import {saveAs} from 'file-saver';
import {ModelService} from '@ame/rdf/services';
import {NamespacesCacheService} from '@ame/cache';

@Component({
  selector: 'ame-generate-documentation',
  templateUrl: './generate-documentation.component.html',
  styleUrls: ['./generate-documentation.component.scss'],
})
export class GenerateDocumentationComponent {
  languages: locale.ILocale[] = [];
  languageControl: FormControl;
  isGenerating = false;

  private get currentCachedFile() {
    return this.namespaceCacheService.currentCachedFile;
  }

  constructor(
    private dialogRef: MatDialogRef<GenerateDocumentationComponent>,
    private languageService: SammLanguageSettingsService,
    private namespaceCacheService: NamespacesCacheService,
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private editorService: EditorService
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
        })
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
            !this.modelService.loadedAspect ? this.currentCachedFile.fileName : `${this.modelService.loadedAspect.name}-documentation.html`
          )
        ),
        finalize(() => {
          this.isGenerating = false;
          this.dialogRef.close();
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close();
  }
}
