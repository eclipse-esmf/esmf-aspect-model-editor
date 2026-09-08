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

import {OpenApi, OpenApiModel} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {CommonModule} from '@angular/common';
import {Component, DestroyRef, effect, ElementRef, inject, OnInit, signal, untracked, viewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {applyWhen, form, FormField, pattern, required, validate} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {map} from 'rxjs';
import {finalize, first} from 'rxjs/operators';
import {EditorService} from '../../../editor.service';

export type {OpenApi, OpenApiModel};

@Component({
  host: {
    '(window:dragover)': '$event.preventDefault()',
    '(window:drop)': 'handleFileDrop($event)',
  },
  selector: 'ame-generate-open-api',
  templateUrl: './generate-open-api.component.html',
  styleUrls: ['./generate-open-api.component.scss'],
  imports: [
    CommonModule,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    TranslocoDirective,
  ],
})
export class GenerateOpenApiComponent implements OnInit {
  readonly dropArea = viewChild<ElementRef>('dropArea');

  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<GenerateOpenApiComponent>);
  private languageService = inject(SammLanguageSettingsService);
  private editorService = inject(EditorService);
  private notificationsService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);
  private loadedFilesService = inject(LoadedFilesService);

  languages = signal<locale.ILocale[]>([]);
  isGenerating = signal(false);
  linkToSpecification = signal('https://eclipse-esmf.github.io/ame-guide/generate/generate-openapi-doc.html');
  uploadedFile = signal<File | null>(null);

  openApiModel = signal<OpenApiModel>({
    baseUrl: 'https://example.com',
    language: '',
    includeQueryApi: false,
    useSemanticVersion: false,
    activateResourcePath: false,
    output: 'yaml',
    paging: 'NO_PAGING',
    resourcePath: '',
    file: null,
    ymlProperties: null,
    jsonProperties: null,
    includePost: false,
    includePut: false,
    includePatch: false,
  });

  openApiForm = form(this.openApiModel, schemaPath => {
    required(schemaPath.baseUrl);
    validate(schemaPath.baseUrl, ({value}) => {
      let validUrl: boolean;
      try {
        new URL(value());
        validUrl = value().includes('.');
      } catch {
        validUrl = false;
      }
      return validUrl ? null : {kind: 'invalidUrl', message: 'Invalid URL'};
    });

    applyWhen(
      schemaPath,
      ({valueOf}) => valueOf(schemaPath.activateResourcePath),
      path => {
        required(path.resourcePath);
        pattern(path.resourcePath, /^\/[a-zA-Z{}/]*$/);
        pattern(path.resourcePath, /^(?!.*\/\/)(?!.*{{)(?!.*}}).*$/);
        pattern(path.resourcePath, /.*({.*})?.*$/);

        applyWhen(
          path,
          ({valueOf}) => /{.*}/.test(valueOf(path.resourcePath) || ''),
          subPath => {
            required(subPath.file);
          },
        );
      },
    );
  });

  constructor() {
    let previousOutput: string | null = null;
    effect(() => {
      const currentOutput = this.openApiModel().output;
      if (previousOutput !== null && previousOutput !== currentOutput) {
        untracked(() => this.removeUploadedFile());
      }
      previousOutput = currentOutput;
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const sammLanguages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languages.set(sammLanguages);
    if (sammLanguages.length > 0) {
      this.openApiModel.update(model => ({
        ...model,
        language: sammLanguages[0].tag,
      }));
    }
  }

  toggleResourcePath(active: boolean): void {
    this.openApiModel.update(model => ({
      ...model,
      activateResourcePath: active,
      resourcePath: active ? model.resourcePath || '/resource/{resourceId}' : '',
    }));
  }

  hasResourcePathError(kind: string): boolean {
    return this.openApiForm
      .resourcePath()
      .errors()
      .some(error => error.kind === kind);
  }

  handleFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (!this.dropArea()?.nativeElement.contains(event.target)) return;

    const files = event.dataTransfer?.files;
    if (files && files.length) {
      const file = files[0];
      if (this.validateFile(file)) {
        this.processFile(file);
      } else {
        this.showError();
      }
    }
  }

  private validateFile(file: File): boolean {
    const fileType = this.openApiModel().output;
    return fileType === 'json' ? file.name.endsWith('.json') : file.name.endsWith('.yaml') || file.name.endsWith('.yml');
  }

  private processFile(file: File): void {
    this.uploadedFile.set(file);
    this.openApiModel.update(model => ({...model, file}));
    this.readFileContent(file);
  }

  private readFileContent(file: File): void {
    const reader = new FileReader();
    reader.onload = () => this.handleFileContent(file, reader.result as string);
    reader.readAsText(file);
  }

  private handleFileContent(file: File, content: string): void {
    const fileType = this.getFileType(file);
    const propertyName = fileType === 'json' ? 'jsonProperties' : 'ymlProperties';
    this.openApiModel.update(model => ({...model, [propertyName]: content}));
  }

  private getFileType(file: File): 'json' | 'yml' {
    if (file.name.endsWith('.json')) {
      return 'json';
    } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
      return 'yml';
    }

    throw new Error('Unsupported file type');
  }

  private showError(): void {
    this.notificationsService.error({
      title: this.translate.translateService.translate('generateOpenapiSpecDialog.uploadErrorTitle'),
      message: this.translate.translateService.translate('generateOpenapiSpecDialog.uploadErrorMessage', {
        output: this.openApiModel().output.toUpperCase(),
      }),
    });
  }

  generateOpenApiSpec(): void {
    this.isGenerating.set(true);
    const model = this.openApiModel();
    const openApiSpec: OpenApi = {
      baseUrl: model.baseUrl,
      language: model.language,
      output: model.output,
      includeQueryApi: model.includeQueryApi,
      useSemanticVersion: model.useSemanticVersion,
      paging: model.paging,
      resourcePath: model.resourcePath,
      ymlProperties: model.ymlProperties ?? '',
      jsonProperties: model.jsonProperties ?? '',
      includePost: model.includePost,
      includePut: model.includePut,
      includePatch: model.includePatch,
    };
    this.editorService
      .generateOpenApiSpec(this.loadedFilesService.currentLoadedFile?.rdfModel, openApiSpec)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        map(data => this.handleGeneratedSpec(data, openApiSpec)),
        finalize(() => {
          this.isGenerating.set(false);
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }

  private handleGeneratedSpec(data: any, spec: OpenApi): void {
    const fileType = spec.output === 'yaml' ? 'text/yaml' : 'application/json;charset=utf-8';
    const fileData = spec.output === 'yaml' ? data : JSON.stringify(data, null, 2);

    const aspectName = this.loadedFilesService.currentLoadedFile.name.slice(0, -4);
    const fileName = `${aspectName}-open-api.${spec.output}`;
    saveAs(new Blob([fileData], {type: fileType}), fileName);
  }

  onFileBrowseHandler($event: Event): void {
    const files = ($event.target as HTMLInputElement).files;

    if (files && files.length) {
      const file = files[0];
      this.uploadedFile.set(file);
      this.readFileContent(file);
      this.openApiModel.update(model => ({...model, file}));
    }
  }

  removeUploadedFile(): void {
    this.uploadedFile.set(null);
    this.openApiModel.update(model => ({
      ...model,
      file: null,
      ymlProperties: null,
      jsonProperties: null,
    }));
  }
}
