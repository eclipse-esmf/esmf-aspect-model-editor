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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {finalize, map, Subscription} from 'rxjs';
import {EditorService} from '../../../editor.service';
import {ModelService} from '@ame/rdf/services';
import * as locale from 'locale-codes';
import {first} from 'rxjs/operators';
import {saveAs} from 'file-saver';

export interface AsyncApi {
  language: string;
  output: string;
  applicationId: string;
  channelAddress: string;
  useSemanticVersion: boolean;
  writeSeparateFiles: boolean;
}

@Component({
  selector: 'ame-generate-async-api',
  templateUrl: './generate-async-api.component.html',
  styleUrls: ['./generate-async-api.component.scss'],
})
export class GenerateAsyncApiComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languages: locale.ILocale[];
  isGenerating = false;
  subscriptions = new Subscription();

  public get output(): FormControl {
    return this.form.get('output') as FormControl;
  }

  public get file(): FormControl {
    return this.form.get('file') as FormControl;
  }

  constructor(
    private dialogRef: MatDialogRef<GenerateAsyncApiComponent>,
    private languageService: SammLanguageSettingsService,
    private modelService: ModelService,
    private editorService: EditorService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.languages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.form = new FormGroup({
      language: new FormControl(this.languages[0].tag),
      output: new FormControl('yaml'),
      applicationId: new FormControl(''),
      channelAddress: new FormControl('', Validators.pattern(/^(?:[a-zA-Z]+:\/\/|\/)?[^\s]*$/)),
      useSemanticVersion: new FormControl(false),
      writeSeparateFiles: new FormControl(false),
    });
  }

  generateAsyncApiSpec(): void {
    this.isGenerating = true;
    const asyncApiSpec = this.form.value as AsyncApi;
    this.subscriptions.add(
      this.editorService
        .generateAsyncApiSpec(this.modelService.currentRdfModel, asyncApiSpec)
        .pipe(
          first(),
          map(data => this.handleGeneratedSpec(data, asyncApiSpec)),
          finalize(() => {
            this.isGenerating = false;
            this.dialogRef.close();
          }),
        )
        .subscribe(),
    );
  }

  private handleGeneratedSpec(data: any, spec: AsyncApi): void {
    const fileType = spec.output === 'yaml' ? 'text/yaml' : 'application/json;charset=utf-8';
    const fileData = spec.output === 'yaml' ? data : JSON.stringify(data, null, 2);
    const fileName = `${spec.language}-async-api.${spec.output}`;
    saveAs(new Blob([fileData], {type: fileType}), fileName);
  }

  getControl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  close(): void {
    this.dialogRef.close();
  }
}
