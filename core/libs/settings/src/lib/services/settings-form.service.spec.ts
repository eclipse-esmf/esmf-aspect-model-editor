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

import {
  ConfigurationService,
  EditorValidationPort,
  GraphSettingsPort,
  ModelSaverPort,
  ModelSessionFacade,
  SammLanguageSettingsService,
} from '@ame/domain';
import {LanguageTranslationService, TauriTunnelPort, TitleService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createDefaultSettingsModel, SettingsFormService} from './settings-form.service';

describe('SettingsFormService', () => {
  let service: SettingsFormService;
  let configurationService: ConfigurationService;
  let sammLanguageSettingsService: SammLanguageSettingsService;
  let loadedFilesService: {
    currentLoadedFile: {
      absoluteName: string;
      aspect: any;
      rdfModel: any;
    } | null;
    updateAbsoluteName: ReturnType<typeof vi.fn>;
  };
  let translateService: {translateService: {getActiveLang: ReturnType<typeof vi.fn>; setActiveLang: ReturnType<typeof vi.fn>}};

  beforeEach(() => {
    localStorage.clear();

    loadedFilesService = {
      currentLoadedFile: {
        absoluteName: 'urn:samm:org.eclipse.esmf:1.0.0:Vehicle.ttl',
        aspect: {},
        rdfModel: {getNamespaces: vi.fn(() => ({}))},
      },
      updateAbsoluteName: vi.fn(),
    };

    translateService = {
      translateService: {
        getActiveLang: vi.fn(() => 'en'),
        setActiveLang: vi.fn(),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        SettingsFormService,
        ConfigurationService,
        SammLanguageSettingsService,
        {provide: ModelSessionFacade, useValue: loadedFilesService},
        {provide: LanguageTranslationService, useValue: translateService},
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: TauriTunnelPort, useValue: {sendTranslationsToTauri: vi.fn()}},
        {provide: GraphSettingsPort, useValue: {formatShapes: vi.fn(), updateGraph: vi.fn(), removeUnnecessaryLanguages: vi.fn()}},
        {provide: ModelSaverPort, useValue: {enableAutoSave: vi.fn()}},
        {provide: EditorValidationPort, useValue: {enableAutoValidation: vi.fn()}},
      ],
    });

    service = TestBed.inject(SettingsFormService);
    configurationService = TestBed.inject(ConfigurationService);
    sammLanguageSettingsService = TestBed.inject(SammLanguageSettingsService);
  });

  it('should be created and initialize form with loaded file data', () => {
    sammLanguageSettingsService.setSammLanguageCodes(['en', 'de']);
    service.initializeForm();

    const model = service.settingsModel();
    expect(model.namespaceConfiguration.aspectUri).toBe('org.eclipse.esmf');
    expect(model.namespaceConfiguration.aspectVersion).toBe('1.0.0');
    expect(model.namespaceConfiguration.aspectName).toBe('Vehicle');
    expect(model.languageConfiguration.aspectModel.length).toBe(2);
  });

  it('should initialize correctly when currentLoadedFile is null', () => {
    loadedFilesService.currentLoadedFile = null;
    service.initializeForm();

    const model = service.settingsModel();
    expect(model.namespaceConfiguration.aspectUri).toBe('');
    expect(model.namespaceConfiguration.aspectVersion).toBe('');
    expect(model.namespaceConfiguration.aspectName).toBe('');
  });

  it('should add and remove languages to remove list', () => {
    service.initializeForm();
    service.addNewLanguage('French', 'fr');

    expect(service.settingsModel().languageConfiguration.aspectModel.length).toBeGreaterThan(0);

    service.addLanguageToBeRemove('fr');
    expect(service.getLanguagesToBeRemove()).toContain('fr');

    service.clearLanguagesToRemove();
    expect(service.getLanguagesToBeRemove()).toEqual([]);
  });

  it('should remove language by index and track removed tag', () => {
    service.settingsModel.set({
      ...service.settingsModel(),
      languageConfiguration: {
        userInterface: 'en',
        aspectModel: [{language: {name: 'German', tag: 'de'}}, {language: {name: 'French', tag: 'fr'}}],
      },
    });

    service.removeLanguage(0);
    expect(service.getLanguagesToBeRemove()).toContain('de');
    expect(service.settingsModel().languageConfiguration.aspectModel.length).toBe(1);
  });

  it('should detect namespace changes', () => {
    service.initializeForm();
    expect(service.hasNamespaceChanged()).toBe(false);

    service.settingsModel.update(m => ({
      ...m,
      namespaceConfiguration: {
        ...m.namespaceConfiguration,
        aspectUri: 'org.changed',
      },
    }));

    // Update configuration settings to reflect changes
    configurationService.setSettings({
      ...configurationService.getSettings(),
      namespace: 'org.changed',
    });

    expect(service.hasNamespaceChanged()).toBe(true);
  });

  it('should update settings through strategies on updateSettings()', () => {
    service.initializeForm();
    service.settingsModel.update(m => ({
      ...m,
      automatedWorkflow: {
        ...m.automatedWorkflow,
        autoSaveEnabled: false,
      },
    }));

    service.updateSettings();
    expect(configurationService.getSettings().autoSaveEnabled).toBe(false);
  });

  it('should validate form constraints with signal form', () => {
    service.initializeForm();
    expect(service.settingsForm().valid()).toBe(true);

    // Invalid namespace pattern
    service.settingsModel.update(m => ({
      ...m,
      namespaceConfiguration: {
        ...m.namespaceConfiguration,
        aspectUri: 'invalid uri with spaces',
      },
    }));
    expect(service.settingsForm.namespaceConfiguration.aspectUri().invalid()).toBe(true);

    // Invalid timer < 60
    service.settingsModel.update(m => ({
      ...m,
      namespaceConfiguration: {
        ...m.namespaceConfiguration,
        aspectUri: 'valid.namespace',
      },
      automatedWorkflow: {
        ...m.automatedWorkflow,
        autoSaveEnabled: true,
        saveTimerSeconds: 30,
      },
    }));
    expect(service.settingsForm.automatedWorkflow.saveTimerSeconds().invalid()).toBe(true);

    // Invalid copyright without #
    service.settingsModel.update(m => ({
      ...m,
      automatedWorkflow: {
        ...m.automatedWorkflow,
        saveTimerSeconds: 60,
      },
      copyrightHeaderConfiguration: {
        copyright: 'Invalid non-hash header line',
      },
    }));
    expect(service.settingsForm.copyrightHeaderConfiguration.copyright().invalid()).toBe(true);
  });
  describe('dirty state', () => {
    beforeEach(() => service.initializeForm());

    it('should be pristine right after initialization', () => {
      expect(service.isDirty()).toBe(false);
    });

    it('should become dirty after a change and pristine again when the change is reverted', () => {
      service.settingsModel.update(m => ({...m, editorConfiguration: {...m.editorConfiguration, darkMode: true}}));
      expect(service.isDirty()).toBe(true);

      service.settingsModel.update(m => ({...m, editorConfiguration: {...m.editorConfiguration, darkMode: false}}));
      expect(service.isDirty()).toBe(false);
    });

    it('should take the current values as new baseline on markPristine()', () => {
      service.settingsModel.update(m => ({...m, copyrightHeaderConfiguration: {copyright: '# 2026'}}));
      service.markPristine();
      expect(service.isDirty()).toBe(false);
    });

    it('should be pristine again after initializeForm()', () => {
      service.settingsModel.update(m => ({...m, copyrightHeaderConfiguration: {copyright: '# changed'}}));
      service.initializeForm();
      expect(service.isDirty()).toBe(false);
    });
  });

  describe('resetSection', () => {
    it('should restore the defaults of the automated workflow only', () => {
      service.settingsModel.update(m => ({
        ...m,
        automatedWorkflow: {...m.automatedWorkflow, autoSaveEnabled: false, saveTimerSeconds: 300, autoFormatEnabled: false},
        editorConfiguration: {...m.editorConfiguration, darkMode: true},
      }));

      service.resetSection('automatedWorkflow');

      expect(service.settingsModel().automatedWorkflow).toEqual(createDefaultSettingsModel().automatedWorkflow);
      expect(service.settingsModel().editorConfiguration.darkMode).toBe(true);
    });

    it('should restore the defaults of the editor configuration', () => {
      service.settingsModel.update(m => ({
        ...m,
        editorConfiguration: {...m.editorConfiguration, darkMode: true, showConnectionLabels: false},
      }));

      service.resetSection('editorConfiguration');

      expect(service.settingsModel().editorConfiguration).toEqual(createDefaultSettingsModel().editorConfiguration);
    });

    it('should not share object references with the defaults', () => {
      service.resetSection('automatedWorkflow');
      expect(service.settingsModel().automatedWorkflow).not.toBe(createDefaultSettingsModel().automatedWorkflow);
    });
  });

  describe('namespace validation depending on a loaded model', () => {
    it('should validate and enable the namespace with a loaded model', () => {
      service.initializeForm();
      expect(service.hasLoadedModel()).toBe(true);
      expect(service.settingsForm.namespaceConfiguration.aspectUri().disabled()).toBe(false);

      service.settingsModel.update(m => ({...m, namespaceConfiguration: {...m.namespaceConfiguration, aspectUri: ''}}));
      expect(service.settingsForm.namespaceConfiguration.aspectUri().invalid()).toBe(true);
      expect(service.settingsForm().invalid()).toBe(true);
    });

    it('should keep the aspect name read-only for models with an aspect', () => {
      service.initializeForm();
      expect(service.settingsForm.namespaceConfiguration.aspectName().disabled()).toBe(true);

      loadedFilesService.currentLoadedFile!.aspect = null;
      service.initializeForm();
      expect(service.settingsForm.namespaceConfiguration.aspectName().disabled()).toBe(false);
    });

    it('should neither validate nor enable the empty namespace without a model', () => {
      loadedFilesService.currentLoadedFile = null;
      service.initializeForm();

      expect(service.hasLoadedModel()).toBe(false);
      expect(service.settingsForm.namespaceConfiguration.aspectUri().disabled()).toBe(true);
      expect(service.settingsForm.namespaceConfiguration.aspectVersion().disabled()).toBe(true);
      expect(service.settingsForm.namespaceConfiguration.aspectName().disabled()).toBe(true);
      expect(service.settingsForm.namespaceConfiguration.aspectUri().invalid()).toBe(false);
      expect(service.settingsForm().invalid()).toBe(false);
    });

    it('should still validate the other sections without a model', () => {
      loadedFilesService.currentLoadedFile = null;
      service.initializeForm();
      service.settingsModel.update(m => ({...m, copyrightHeaderConfiguration: {copyright: 'missing hash'}}));

      expect(service.settingsForm().invalid()).toBe(true);
    });
  });
});
