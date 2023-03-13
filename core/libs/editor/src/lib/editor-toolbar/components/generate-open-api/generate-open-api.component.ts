/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {LanguageSettingsService} from '@ame/settings-dialog';
import {EditorDialogValidators} from '../../../editor-dialog';

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
  public form: FormGroup;
  public languages: locale.ILocale[];

  constructor(private dialogRef: MatDialogRef<GenerateOpenApiComponent>, private languageService: LanguageSettingsService) {}

  ngOnInit() {
    this.languages = this.languageService.getLanguageCodes().map(tag => locale.getByTag(tag));
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

  generateOpenApiSpec() {
    this.dialogRef.close({
      output: this.getControlValue('output'),
      baseUrl: this.getControlValue('baseUrl') as string,
      includeQueryApi: this.getControlValue('includeQueryApi') as boolean,
      useSemanticVersion: this.getControlValue('useSemanticVersion') as boolean,
      paging: this.getControlValue('paging') as string,
      language: this.getControlValue('language') as string,
    });
  }

  close() {
    this.dialogRef.close();
  }

  getControl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  getControlValue(path: string): string | boolean {
    return this.getControl(path).value;
  }
}
