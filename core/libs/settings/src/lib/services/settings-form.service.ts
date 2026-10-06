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
import {ConfigurationService, ModelHeaderService, ModelSessionFacade, NamespaceFile, SammLanguageSettingsService} from '@ame/domain';
import {DEFAULT_ELEMENT_ORDER_STRATEGY, GeneralConfig, LanguageTranslationService} from '@ame/shared';
import {computed, inject, Injectable, signal} from '@angular/core';
import {applyWhen, disabled, form, pattern, required, validate} from '@angular/forms/signals';
import {RdfModel} from '@esmf/aspect-model-loader';
import * as locale from 'locale-codes';
import {AspectModelLanguageEntry, NamespaceConfiguration, SettingsFormData} from '../model';
import {AutomatedWorkflowUpdateStrategy} from '../strategy/automated-workflow-update.strategy';
import {CopyrightHeaderUpdateStrategy} from '../strategy/copyright-header-update.strategy';
import {EditorConfigurationUpdateStrategy} from '../strategy/editor-configuration-update.strategy';
import {LanguageConfigurationUpdateStrategy} from '../strategy/language-configuration-update.strategy';
import {NamespaceConfigurationUpdateStrategy} from '../strategy/namespace-configuration-update.strategy';
import {SettingsUpdateStrategy} from '../strategy/settings-update.strategy';

export const createDefaultSettingsModel = (): SettingsFormData => ({
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
    elementOrderStrategy: DEFAULT_ELEMENT_ORDER_STRATEGY,
    restoreSession: true,
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
  private readonly loadedFilesService = inject(ModelSessionFacade);
  private readonly modelHeaderService = inject(ModelHeaderService);

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

  /** Whether a model is loaded; model specific settings (namespace) are only editable and validated then. */
  readonly hasLoadedModel = signal(false);

  /** The aspect name is derived from the aspect and therefore read-only when the model has one. */
  private readonly hasAspect = signal(false);

  private readonly pristineSnapshot = signal(JSON.stringify(this.settingsModel()));

  /** True as soon as the form differs from the last loaded or applied settings. */
  readonly isDirty = computed(() => JSON.stringify(this.settingsModel()) !== this.pristineSnapshot());

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

    // Namespace configuration: belongs to the loaded model, without a model it must not block saving.
    applyWhen(
      schemaPath.namespaceConfiguration,
      () => this.hasLoadedModel(),
      namespacePath => {
        required(namespacePath.aspectUri);
        pattern(namespacePath.aspectUri, /^[A-Za-z0-9]+([.-][A-Za-z0-9_]+)*$/);

        required(namespacePath.aspectVersion);
        pattern(namespacePath.aspectVersion, /^\d+\.\d+\.\d+(-[A-Za-z0-9]+)?$/);
      },
    );
    disabled(schemaPath.namespaceConfiguration.aspectUri, {when: () => !this.hasLoadedModel()});
    disabled(schemaPath.namespaceConfiguration.aspectVersion, {when: () => !this.hasLoadedModel()});

    disabled(schemaPath.namespaceConfiguration.aspectName, {
      when: () => !this.hasLoadedModel() || this.hasAspect(),
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
    this.hasLoadedModel.set(!!this.currentLoadedFile);
    this.hasAspect.set(!!this.currentLoadedFile?.aspect);
    this.initializeNamespaceAndVersion();
    this.createForm();
    this.populateLanguages();
    this.markPristine();
  }

  /** Takes the current form values as the new "unchanged" state, e.g. after loading or applying settings. */
  markPristine(): void {
    this.pristineSnapshot.set(JSON.stringify(this.settingsModel()));
  }

  /** Restores the default values of an application wide settings section. */
  resetSection(section: 'automatedWorkflow' | 'editorConfiguration'): void {
    const defaults = createDefaultSettingsModel();
    this.settingsModel.update(model => ({...model, [section]: {...defaults[section]}}));
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
        elementOrderStrategy: settings.elementOrderStrategy ?? DEFAULT_ELEMENT_ORDER_STRATEGY,
        restoreSession: settings.restoreSession !== false,
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
        copyright: this.currentLoadedFile
          ? this.modelHeaderService.getHeaderText(this.currentLoadedFile.rdfModel)
          : (settings.copyrightHeader || []).join('\n'),
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
