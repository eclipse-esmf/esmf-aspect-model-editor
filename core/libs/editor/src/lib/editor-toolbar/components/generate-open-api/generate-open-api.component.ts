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

import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as locale from 'locale-codes';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {EditorDialogValidators} from '../../../editor-dialog';
import {finalize, first} from 'rxjs/operators';
import {map, Subscription} from 'rxjs';
import {saveAs} from 'file-saver';
import {EditorService} from '../../../editor.service';
import {ModelService} from '@ame/rdf/services';
import {LanguageTranslationService} from '@ame/translation';
import {NotificationsService} from '@ame/shared';

export interface OpenApi {
  language: string;
  output: string;
  baseUrl: string;
  includeQueryApi: boolean;
  useSemanticVersion: boolean;
  paging: string;
  resourcePath: string;
  ymlProperties: string;
  jsonProperties: string;
}

@Component({
  selector: 'ame-generate-open-api',
  templateUrl: './generate-open-api.component.html',
  styleUrls: ['./generate-open-api.component.scss'],
})
export class GenerateOpenApiComponent implements OnInit, OnDestroy {
  @ViewChild('dropArea') dropArea: ElementRef;

  form: FormGroup;
  languages: locale.ILocale[];
  isGenerating = false;
  linkToSpecification = '';
  uploadedFile: File = undefined;
  subscriptions = new Subscription();

  private resourcePathValidators = [];

  public get output(): FormControl {
    return this.form.get('output') as FormControl;
  }

  public get activateResourcePath(): FormControl {
    return this.form.get('activateResourcePath') as FormControl;
  }

  public get file(): FormControl {
    return this.form.get('file') as FormControl;
  }

  public get ymlProperties(): FormControl {
    return this.form.get('ymlProperties') as FormControl;
  }

  public get jsonProperties(): FormControl {
    return this.form.get('jsonProperties') as FormControl;
  }

  constructor(
    private dialogRef: MatDialogRef<GenerateOpenApiComponent>,
    private languageService: SammLanguageSettingsService,
    private modelService: ModelService,
    private editorService: EditorService,
    private notificationsService: NotificationsService,
    private translate: LanguageTranslationService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.resourcePathValidators = [
      Validators.required,
      Validators.pattern(/^\/[a-zA-Z{}/]*$/),
      Validators.pattern(/^(?!.*\/\/)(?!.*{{)(?!.*}}).*$/),
    ];

    this.languages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.form = new FormGroup({
      baseUrl: new FormControl('https://example.com', Validators.compose([Validators.required, EditorDialogValidators.baseUrl])),
      language: new FormControl(this.languages[0].tag),
      includeQueryApi: new FormControl(false),
      useSemanticVersion: new FormControl(false),
      activateResourcePath: new FormControl(false),
      output: new FormControl('yaml'),
      paging: new FormControl('NO_PAGING'),
      resourcePath: new FormControl('/', this.resourcePathValidators),
      file: new FormControl(null),
      ymlProperties: new FormControl(null),
      jsonProperties: new FormControl(null),
    });
  }

  private setupFormListeners(): void {
    this.subscriptions.add(this.output?.valueChanges.subscribe(() => this.removeUploadedFile()));

    this.subscriptions.add(
      this.activateResourcePath?.valueChanges.subscribe(activateResourcePath => {
        const resourcePathControl = this.form.get('resourcePath');
        activateResourcePath ? resourcePathControl?.setValidators(this.resourcePathValidators) : resourcePathControl?.setValidators(null);
        resourcePathControl?.updateValueAndValidity();
      }),
    );

    this.subscriptions.add(
      this.form.get('resourcePath')?.valueChanges.subscribe(resourcePath => {
        const fileControl = this.file;
        const brackets = resourcePath.includes('{') && resourcePath.includes('}');
        brackets ? fileControl?.setValidators([Validators.required]) : fileControl?.setValidators([]);
        fileControl?.updateValueAndValidity();
      }),
    );
  }

  @HostListener('dragover', ['$event'])
  preventDragDefaults(event: Event): void {
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  handleFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (!this.dropArea.nativeElement.contains(event.target)) return;

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
    const fileType = this.form.value.output;
    return fileType === 'json' ? file.name.endsWith('.json') : file.name.endsWith('.yaml') || file.name.endsWith('.yml');
  }

  private processFile(file: File): void {
    this.uploadedFile = file;
    this.form.patchValue({file: file});
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
    this.form.patchValue({[propertyName]: content});
  }

  private getFileType(file: File): 'json' | 'yaml' {
    if (file.name.endsWith('.json')) {
      return 'json';
    } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
      return 'yaml';
    }

    throw new Error('Unsupported file type');
  }

  private showError(): void {
    this.notificationsService.error({
      title: this.translate.translateService.instant('GENERATE_OPENAPI_SPEC_DIALOG.UPLOAD_ERROR_TITLE'),
      message: this.translate.translateService.instant('GENERATE_OPENAPI_SPEC_DIALOG.UPLOAD_ERROR_MESSAGE', {
        output: this.form.value.output.toUpperCase(),
      }),
    });
  }

  generateOpenApiSpec(): void {
    this.isGenerating = true;
    const openApiSpec = this.form.value as OpenApi;
    this.subscriptions.add(
      this.editorService
        .generateOpenApiSpec(this.modelService.currentRdfModel, openApiSpec)
        .pipe(
          first(),
          map(data => this.handleGeneratedSpec(data, openApiSpec)),
          finalize(() => {
            this.isGenerating = false;
            this.dialogRef.close();
          }),
        )
        .subscribe(),
    );
  }

  private handleGeneratedSpec(data: any, spec: OpenApi): void {
    const fileType = spec.output === 'yaml' ? 'text/yaml' : 'application/json;charset=utf-8';
    const fileData = spec.output === 'yaml' ? data : JSON.stringify(data, null, 2);
    const fileName = `${spec.language}-open-api.${spec.output}`;
    saveAs(new Blob([fileData], {type: fileType}), fileName);
  }

  onFileBrowseHandler($event: Event): void {
    const files = ($event.target as HTMLInputElement).files;

    if (files.length) {
      const file = files[0];
      this.uploadedFile = file;
      this.addFileContentIntoControl(file);
      this.file.patchValue(file);
    }
  }

  private addFileContentIntoControl(file: File): void {
    const reader = new FileReader();
    reader.onload = event => {
      this.ymlProperties?.setValue(event.target.result);
    };
    reader.readAsText(file);
  }

  removeUploadedFile(): void {
    this.uploadedFile = null;
    this.ymlProperties?.reset();
    this.jsonProperties?.reset();
    this.file?.reset();
  }

  getControl(path: string): FormControl {
    return this.form.get(path) as FormControl;
  }

  getControlValue(path: string): string | boolean {
    return this.getControl(path).value;
  }

  close(): void {
    this.dialogRef.close();
  }
}
