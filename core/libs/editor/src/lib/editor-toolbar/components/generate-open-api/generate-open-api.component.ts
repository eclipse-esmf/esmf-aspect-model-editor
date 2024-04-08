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

import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import * as locale from 'locale-codes';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {EditorDialogValidators} from '../../../editor-dialog';
import {finalize, first} from 'rxjs/operators';
import {map} from 'rxjs';
import {saveAs} from 'file-saver';
import {EditorService, GenerateService} from '../../../services';
import {ModelService} from '@ame/rdf/services';
import {NamespacesCacheService} from '@ame/cache';

export interface OpenApi {
  language: string;
  output: string;
  baseUrl: string;
  includeQueryApi: boolean;
  useSemanticVersion: boolean;
  paging: string;
}

@Component({
  selector: 'ame-generate-open-api',
  templateUrl: './generate-open-api.component.html',
  styleUrls: ['./generate-open-api.component.scss'],
})
export class GenerateOpenApiComponent implements OnInit {
  form: FormGroup;
  languages: locale.ILocale[];
  isGenerating = false;

  private get currentCachedFile() {
    return this.namespaceCacheService.currentCachedFile;
  }

  constructor(
    private dialogRef: MatDialogRef<GenerateOpenApiComponent>,
    private languageService: SammLanguageSettingsService,
    private namespaceCacheService: NamespacesCacheService,
    private modelService: ModelService,
    private generateService: GenerateService,
  ) {}

  ngOnInit(): void {
    this.languages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.form = new FormGroup({
      baseUrl: new FormControl('https://example.com', {
        validators: [EditorDialogValidators.baseUrl],
        updateOn: 'blur',
      }),
      language: new FormControl(this.languages[0].tag),
      includeQueryApi: new FormControl(false),
      useSemanticVersion: new FormControl(false),
      output: new FormControl('json'),
      paging: new FormControl('NO_PAGING'),
    });
  }

  generateOpenApiSpec(): void {
    const openApi: OpenApi = {
      output: this.getControlValue('output') as string,
      baseUrl: this.getControlValue('baseUrl') as string,
      includeQueryApi: this.getControlValue('includeQueryApi') as boolean,
      useSemanticVersion: this.getControlValue('useSemanticVersion') as boolean,
      paging: this.getControlValue('paging') as string,
      language: this.getControlValue('language') as string,
    };

    this.isGenerating = true;

    this.generateService
      .generateOpenApiSpec(this.modelService.currentRdfModel, openApi)
      .pipe(
        first(),
        map(data => {
          if (openApi.output === 'yaml') {
            saveAs(
              new Blob([data], {
                type: 'text/yaml',
              }),
              `${this.modelService.loadedAspect.name}-open-api.yaml`,
            );
          } else {
            saveAs(
              new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json;charset=utf-8',
              }),
              !this.modelService.loadedAspect ? this.currentCachedFile.fileName : `${this.modelService.loadedAspect.name}-open-api.json`,
            );
          }
        }),
        finalize(() => {
          this.isGenerating = false;
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close();
  }

  getControl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  getControlValue(path: string): string | boolean {
    return this.getControl(path).value;
  }
}
