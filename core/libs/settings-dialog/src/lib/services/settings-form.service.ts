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
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ConfigurationService, NamespaceConfiguration, SammLanguageSettingsService} from '@ame/settings-dialog';
import {GeneralConfig} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable, inject} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {RdfModel} from '@esmf/aspect-model-loader';
import * as locale from 'locale-codes';
import {
  AutomatedWorkflowUpdateStrategy,
  EditorConfigurationUpdateStrategy,
  LanguageConfigurationUpdateStrategy,
  NamespaceConfigurationUpdateStrategy,
  SettingsUpdateStrategy,
} from '../strategy';
import {CopyrightHeaderUpdateStrategy} from '../strategy/copyright-header-update.strategy';

function createRegexValidator(regex: RegExp, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = regex.test(control.value);
    return valid ? null : {[errorKey]: {value: control.value}};
  };
}

export const namespaceValidator = (): ValidatorFn => createRegexValidator(/^[A-Za-z0-9]+([.-][A-Za-z0-9_]+)*$/, 'invalidPattern');

export const versionFormatValidator = (): ValidatorFn => createRegexValidator(/^\d+\.\d+\.\d+(-[A-Za-z0-9]+)?$/, 'invalidVersionFormat');
@Injectable({
  providedIn: 'root',
})
export class SettingsFormService {
  private loadedFilesService = inject(LoadedFilesService);

  private get currentLoadedFile(): NamespaceFile {
    return this.loadedFilesService.currentLoadedFile;
  }
  private form: FormGroup;
  private namespace: string;
  private version: string;
  private strategies: Array<SettingsUpdateStrategy>;
  private languagesToBeRemove: Array<string> = [];

  constructor(
    private formBuilder: FormBuilder,
    private configurationService: ConfigurationService,
    private translate: LanguageTranslationService,
    private sammLangService: SammLanguageSettingsService,
    private automatedWorkflowStrategy: AutomatedWorkflowUpdateStrategy,
    private editorConfigStrategy: EditorConfigurationUpdateStrategy,
    private languageConfigStrategy: LanguageConfigurationUpdateStrategy,
    private namespaceConfigStrategy: NamespaceConfigurationUpdateStrategy,
    private copyrightHeaderUpdateStrategy: CopyrightHeaderUpdateStrategy,
  ) {
    this.strategies = [
      this.automatedWorkflowStrategy,
      this.editorConfigStrategy,
      this.languageConfigStrategy,
      this.namespaceConfigStrategy,
      this.copyrightHeaderUpdateStrategy,
    ];
  }

  public initializeForm(): void {
    this.initializeNamespaceAndVersion();
    this.createForm();
    this.populateLanguages();
  }

  private initializeNamespaceAndVersion(): void {
    const [namespace, version] = this.parseRdfModelFilename();
    this.namespace = namespace;
    this.version = version;
  }

  private parseRdfModelFilename(): Array<string> {
    if (!this.currentLoadedFile) {
      return ['', '', ''];
    }

    return this.currentLoadedFile?.absoluteName.replace('.ttl', '').replace('urn:samm:', '').split(':');
  }

  private createForm(): void {
    const [namespace, version, modelName] = this.parseRdfModelFilename();
    const settings = this.configurationService.getSettings();

    this.form = this.formBuilder.group({
      automatedWorkflow: this.formBuilder.group({
        autoSaveEnabled: [settings.autoSaveEnabled],
        saveTimerSeconds: [
          {
            value: settings.saveTimerSeconds,
            disabled: !settings.autoSaveEnabled,
          },
          [Validators.min(60)],
        ],
        autoValidationEnabled: [settings.autoValidationEnabled],
        validationTimerSeconds: [
          {
            value: settings.validationTimerSeconds,
            disabled: !settings.autoValidationEnabled,
          },
          [Validators.min(60)],
        ],
        autoFormatEnabled: [settings.autoFormatEnabled],
      }),
      editorConfiguration: this.formBuilder.group({
        enableHierarchicalLayout: [settings.enableHierarchicalLayout],
        showEntityValueEntityEdge: [settings.showEntityValueEntityEdge],
        showConnectionLabels: [settings.showConnectionLabels],
        showAbstractPropertyConnection: [settings.showAbstractPropertyConnection],
      }),
      languageConfiguration: this.formBuilder.group({
        userInterface: [this.translate.translateService.currentLang],
        aspectModel: this.formBuilder.array([]),
      }),
      namespaceConfiguration: this.formBuilder.group({
        aspectUri: [namespace, [Validators.required, namespaceValidator()]],
        aspectName: [{value: modelName, disabled: !!this.currentLoadedFile?.aspect}],
        aspectVersion: [version, [Validators.required, versionFormatValidator()]],
        sammVersion: [{value: GeneralConfig.sammVersion, disabled: true}],
      }),
      copyrightHeaderConfiguration: this.formBuilder.group({
        copyright: [settings.copyrightHeader.join('\n'), [this.startsWithoutHashValidator]],
      }),
    });
  }

  private startsWithoutHashValidator(control: FormControl): {[key: string]: boolean} | null {
    return control.value && control.value.split('\n').some((line: string) => line.trim() !== '' && !line.startsWith('#'))
      ? {startsWithoutHash: true}
      : null;
  }

  private populateLanguages(): void {
    this.sammLangService.getSammLanguageCodes().forEach(languageCode => {
      const lang = locale.getByTag(languageCode);
      this.addNewLanguage(lang.name, lang.tag);
    });
  }

  addNewLanguage(name?: string, tag?: string): void {
    const aspectModelArray = this.form.get('languageConfiguration').get('aspectModel') as FormArray;
    const value = name && tag ? {name: name, tag: tag} : '';
    aspectModelArray.push(
      this.formBuilder.group({
        language: [value, Validators.required],
      }),
    );
  }

  public updateSettings(): void {
    const settings = this.configurationService.getSettings();
    this.strategies.forEach(strategy => strategy.updateSettings(this.form, settings));
    this.configurationService.setLocalStorageItem(settings);
  }

  hasNamespaceChanged(): boolean {
    const {oldNamespace, newNamespace, oldVersion, newVersion} = this.getNamespaceConfiguration();
    return oldNamespace !== newNamespace || oldVersion !== newVersion;
  }

  getNamespaceConfiguration(): any {
    const settings = this.configurationService.getSettings();

    return {
      oldNamespace: this.namespace,
      oldVersion: this.version,
      rdfModel: this.currentLoadedFile.rdfModel,
      newNamespace: settings.namespace,
      newVersion: settings.version,
    } as NamespaceConfiguration;
  }

  getForm(): FormGroup {
    return this.form;
  }

  getLoadedRdfModel(): RdfModel {
    return this.currentLoadedFile.rdfModel;
  }

  setNamespace(value: string): void {
    this.namespace = value;
  }

  setVersion(value: string): void {
    this.version = value;
  }

  getLanguagesToBeRemove(): Array<string> {
    return this.languagesToBeRemove;
  }

  addLanguageToBeRemove(value: string): void {
    this.languagesToBeRemove.push(value);
  }

  clearLanguagesToRemove(): void {
    this.languagesToBeRemove = [];
  }
}
