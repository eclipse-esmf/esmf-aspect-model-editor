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
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {GeneralConfig} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable, signal} from '@angular/core';
import {disabled, form, pattern, required, validate} from '@angular/forms/signals';
import {RdfModel} from '@esmf/aspect-model-loader';
import * as locale from 'locale-codes';
import {AspectModelLanguageEntry, NamespaceConfiguration, SettingsFormData} from '../model';
import {AutomatedWorkflowUpdateStrategy} from '../strategy/automated-workflow-update.strategy';
import {CopyrightHeaderUpdateStrategy} from '../strategy/copyright-header-update.strategy';
import {EditorConfigurationUpdateStrategy} from '../strategy/editor-configuration-update.strategy';
import {LanguageConfigurationUpdateStrategy} from '../strategy/language-configuration-update.strategy';
import {NamespaceConfigurationUpdateStrategy} from '../strategy/namespace-configuration-update.strategy';
import {SettingsUpdateStrategy} from '../strategy/settings-update.strategy';
import {ConfigurationService} from './configuration.service';
import {SammLanguageSettingsService} from './samm-language-settings.service';

const createDefaultSettingsModel = (): SettingsFormData => ({
  automatedWorkflow: {
    autoSaveEnabled: true,
    saveTimerSeconds: 60,
    autoValidationEnabled: true,
    validationTimerSeconds: 400,
    autoFormatEnabled: true,
  },
  editorConfiguration: {
    enableHierarchicalLayout: true,
    showConnectionLabels: true,
    darkMode: false,
  },
  languageConfiguration: {
    userInterface: 'en',
    aspectModel: [],
  },
  namespaceConfiguration: {
    aspectUri: '',
    aspectName: '',
    aspectVersion: '',
    sammVersion: GeneralConfig?.sammVersion || '2.3.0',
  },
  copyrightHeaderConfiguration: {
    copyright: '',
  },
});

@Injectable({providedIn: 'root'})
export class SettingsFormService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly sammLangService = inject(SammLanguageSettingsService);
  private readonly automatedWorkflowStrategy = inject(AutomatedWorkflowUpdateStrategy);
  private readonly editorConfigStrategy = inject(EditorConfigurationUpdateStrategy);
  private readonly languageConfigStrategy = inject(LanguageConfigurationUpdateStrategy);
  private readonly namespaceConfigStrategy = inject(NamespaceConfigurationUpdateStrategy);
  private readonly copyrightHeaderUpdateStrategy = inject(CopyrightHeaderUpdateStrategy);
  private readonly loadedFilesService = inject(LoadedFilesService);

  private get currentLoadedFile(): NamespaceFile | undefined {
    return this.loadedFilesService.currentLoadedFile;
  }

  private namespace = '';
  private version = '';
  private readonly strategies: SettingsUpdateStrategy[] = [
    this.automatedWorkflowStrategy,
    this.editorConfigStrategy,
    this.languageConfigStrategy,
    this.namespaceConfigStrategy,
    this.copyrightHeaderUpdateStrategy,
  ];
  private languagesToBeRemove: string[] = [];

  readonly settingsModel = signal<SettingsFormData>(createDefaultSettingsModel());

  readonly settingsForm = form(this.settingsModel, schemaPath => {
    // Automated workflow
    disabled(schemaPath.automatedWorkflow.saveTimerSeconds, {
      when: () => !this.settingsModel().automatedWorkflow.autoSaveEnabled,
    });
    validate(schemaPath.automatedWorkflow.saveTimerSeconds, ({value}) => {
      const val = value();
      if (this.settingsModel().automatedWorkflow.autoSaveEnabled && (val === null || val === undefined || val < 60)) {
        return {kind: 'min', message: 'Min. 60 seconds'};
      }
      return null;
    });

    disabled(schemaPath.automatedWorkflow.validationTimerSeconds, {
      when: () => !this.settingsModel().automatedWorkflow.autoValidationEnabled,
    });
    validate(schemaPath.automatedWorkflow.validationTimerSeconds, ({value}) => {
      const val = value();
      if (this.settingsModel().automatedWorkflow.autoValidationEnabled && (val === null || val === undefined || val < 60)) {
        return {kind: 'min', message: 'Min. 60 seconds'};
      }
      return null;
    });

    // Namespace configuration
    required(schemaPath.namespaceConfiguration.aspectUri);
    pattern(schemaPath.namespaceConfiguration.aspectUri, /^[A-Za-z0-9]+([.-][A-Za-z0-9_]+)*$/);

    required(schemaPath.namespaceConfiguration.aspectVersion);
    pattern(schemaPath.namespaceConfiguration.aspectVersion, /^\d+\.\d+\.\d+(-[A-Za-z0-9]+)?$/);

    disabled(schemaPath.namespaceConfiguration.aspectName, {
      when: () => !!this.currentLoadedFile?.aspect,
    });
    disabled(schemaPath.namespaceConfiguration.sammVersion, {
      when: () => true,
    });

    // Copyright
    validate(schemaPath.copyrightHeaderConfiguration.copyright, ({value}) => {
      const text = value();
      if (text && text.split('\n').some((line: string) => line.trim() !== '' && !line.startsWith('#'))) {
        return {kind: 'startsWithoutHash', message: 'All lines must start with #'};
      }
      return null;
    });
  });

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

  private parseRdfModelFilename(): string[] {
    if (!this.currentLoadedFile) {
      return ['', '', ''];
    }

    return this.currentLoadedFile.absoluteName.replace('.ttl', '').replace('urn:samm:', '').split(':');
  }

  private createForm(): void {
    const [namespace, version, modelName] = this.parseRdfModelFilename();
    const settings = this.configurationService.getSettings();

    this.settingsModel.set({
      automatedWorkflow: {
        autoSaveEnabled: settings.autoSaveEnabled,
        saveTimerSeconds: settings.saveTimerSeconds,
        autoValidationEnabled: settings.autoValidationEnabled,
        validationTimerSeconds: settings.validationTimerSeconds,
        autoFormatEnabled: settings.autoFormatEnabled,
      },
      editorConfiguration: {
        enableHierarchicalLayout: settings.enableHierarchicalLayout,
        showConnectionLabels: settings.showConnectionLabels,
        darkMode: settings.darkMode ?? false,
      },
      languageConfiguration: {
        userInterface: this.translate.translateService.getActiveLang(),
        aspectModel: [],
      },
      namespaceConfiguration: {
        aspectUri: namespace || '',
        aspectName: modelName || '',
        aspectVersion: version || '',
        sammVersion: GeneralConfig?.sammVersion || '2.3.0',
      },
      copyrightHeaderConfiguration: {
        copyright: (settings.copyrightHeader || []).join('\n'),
      },
    });
  }

  private populateLanguages(): void {
    const languages: AspectModelLanguageEntry[] = [];
    this.sammLangService.getSammLanguageCodes().forEach(languageCode => {
      const lang = locale.getByTag(languageCode);
      if (lang) {
        languages.push({language: {name: lang.name, tag: lang.tag}});
      } else {
        languages.push({language: {name: languageCode, tag: languageCode}});
      }
    });

    this.settingsModel.update(model => ({
      ...model,
      languageConfiguration: {
        ...model.languageConfiguration,
        aspectModel: languages,
      },
    }));
  }

  addNewLanguage(name?: string, tag?: string): void {
    const langEntry: AspectModelLanguageEntry = name && tag ? {language: {name, tag}} : {language: null};
    this.settingsModel.update(model => ({
      ...model,
      languageConfiguration: {
        ...model.languageConfiguration,
        aspectModel: [...model.languageConfiguration.aspectModel, langEntry],
      },
    }));
  }

  removeLanguage(index: number): void {
    const entry = this.settingsModel().languageConfiguration.aspectModel[index];
    const tag = typeof entry?.language === 'object' && entry?.language ? entry.language.tag : String(entry?.language || '');
    if (tag) {
      this.addLanguageToBeRemove(tag);
    }
    this.settingsModel.update(model => ({
      ...model,
      languageConfiguration: {
        ...model.languageConfiguration,
        aspectModel: model.languageConfiguration.aspectModel.filter((_, i) => i !== index),
      },
    }));
  }

  public updateSettings(): void {
    const settings = this.configurationService.getSettings();
    const model = this.settingsModel();
    this.strategies.forEach(strategy => strategy.updateSettings(model, settings));
    this.configurationService.setLocalStorageItem(settings);
  }

  hasNamespaceChanged(): boolean {
    const {oldNamespace, newNamespace, oldVersion, newVersion} = this.getNamespaceConfiguration();
    return oldNamespace !== newNamespace || oldVersion !== newVersion;
  }

  getNamespaceConfiguration(): NamespaceConfiguration {
    const model = this.settingsModel().namespaceConfiguration;

    return {
      oldNamespace: this.namespace,
      oldVersion: this.version,
      rdfModel: this.currentLoadedFile?.rdfModel,
      newNamespace: model.aspectUri,
      newVersion: model.aspectVersion,
    } as NamespaceConfiguration;
  }

  getLoadedRdfModel(): RdfModel | undefined {
    return this.currentLoadedFile?.rdfModel;
  }

  setNamespace(value: string): void {
    this.namespace = value;
  }

  setVersion(value: string): void {
    this.version = value;
  }

  getLanguagesToBeRemove(): string[] {
    return this.languagesToBeRemove;
  }

  addLanguageToBeRemove(value: string): void {
    this.languagesToBeRemove.push(value);
  }

  clearLanguagesToRemove(): void {
    this.languagesToBeRemove = [];
  }
}
