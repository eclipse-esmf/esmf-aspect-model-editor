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

import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {form, FormField, pattern} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {TranslocoDirective} from '@jsverse/transloco';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {finalize, map} from 'rxjs';
import {first} from 'rxjs/operators';
import {EditorService} from '../../../editor.service';

import {AsyncApi} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';

export type {AsyncApi};

@Component({
  selector: 'ame-generate-async-api',
  templateUrl: './generate-async-api.component.html',
  styleUrls: ['./generate-async-api.component.scss'],
  imports: [
    MatDialogModule,
    TranslocoDirective,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    FormField,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatInputModule,
    MatIcon,
  ],
})
export class GenerateAsyncApiComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private languageService = inject(SammLanguageSettingsService);
  private editorService = inject(EditorService);
  private dialogRef = inject(MatDialogRef<GenerateAsyncApiComponent>);
  private loadedFilesService = inject(LoadedFilesService);

  languages = signal<locale.ILocale[]>([]);
  isGenerating = signal(false);

  asyncApiModel = signal<AsyncApi>({
    language: '',
    output: 'yaml',
    applicationId: '',
    channelAddress: '',
    useSemanticVersion: false,
    writeSeparateFiles: false,
  });

  asyncApiForm = form(this.asyncApiModel, schemaPath => {
    pattern(schemaPath.channelAddress, /^(?:[a-zA-Z]+:\/\/|\/)?[^\s]*$/);
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const sammLanguages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languages.set(sammLanguages);
    if (sammLanguages.length > 0) {
      this.asyncApiModel.update(model => ({
        ...model,
        language: sammLanguages[0].tag,
      }));
    }
  }

  generateAsyncApiSpec(): void {
    this.isGenerating.set(true);
    const asyncApiSpec = this.asyncApiModel();
    this.editorService
      .generateAsyncApiSpec(this.loadedFilesService.currentLoadedFile?.rdfModel, asyncApiSpec)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        map(data => this.handleGeneratedSpec(data, asyncApiSpec)),
        finalize(() => {
          this.isGenerating.set(false);
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  private handleGeneratedSpec(data: any, spec: AsyncApi): void {
    const fileType = spec.output === 'yaml' ? 'text/yaml' : 'application/json;charset=utf-8';
    const fileData = spec.output === 'yaml' ? data : JSON.stringify(data, null, 2);
    const aspectName = this.loadedFilesService.currentLoadedFile.name.slice(0, -4);
    const formattedAspectName = `${aspectName}-async-api`;
    const fileName = `${formattedAspectName}.${spec.writeSeparateFiles ? 'zip' : spec.output}`;
    saveAs(new Blob([fileData], {type: fileType}), fileName);
  }
}
