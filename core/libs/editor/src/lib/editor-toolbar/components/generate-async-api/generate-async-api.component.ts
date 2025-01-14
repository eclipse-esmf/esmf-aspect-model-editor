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

import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {LanguageTranslateModule} from '@ame/translation';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {Subscription, finalize, map} from 'rxjs';
import {first} from 'rxjs/operators';
import {EditorService} from '../../../editor.service';

import {LoadedFilesService} from '@ame/cache';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';

export interface AsyncApi {
  language: string;
  output: string;
  applicationId: string;
  channelAddress: string;
  useSemanticVersion: boolean;
  writeSeparateFiles: boolean;
}

@Component({
  standalone: true,
  selector: 'ame-generate-async-api',
  templateUrl: './generate-async-api.component.html',
  styleUrls: ['./generate-async-api.component.scss'],
  imports: [
    MatDialogModule,
    LanguageTranslateModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatInputModule,
    MatIcon,
  ],
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
    private loadedFilesService: LoadedFilesService,
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
        .generateAsyncApiSpec(this.loadedFilesService.currentLoadedFile?.rdfModel, asyncApiSpec)
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
    const aspectName = this.loadedFilesService.currentLoadedFile.name.slice(0, -4);
    const formattedAspectName = `${aspectName}-async-api`;
    const fileName = `${formattedAspectName}.${spec.writeSeparateFiles ? 'zip' : spec.output}`;
    saveAs(new Blob([fileData], {type: fileType}), fileName);
  }

  getControl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }
}
