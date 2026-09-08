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

import {LoadedFilesService} from '@ame/cache';
import {EditorService, ModelSaverService} from '@ame/editor';
import {MaxGraphService} from '@ame/max-graph';
import {ElectronTunnelService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfigurationService} from './configuration.service';
import {SammLanguageSettingsService} from './samm-language-settings.service';
import {SettingsFormService} from './settings-form.service';

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
        {provide: LoadedFilesService, useValue: loadedFilesService},
        {provide: LanguageTranslationService, useValue: translateService},
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: ElectronTunnelService, useValue: {sendTranslationsToElectron: vi.fn()}},
        {provide: MaxGraphService, useValue: {formatShapes: vi.fn()}},
        {provide: ModelSaverService, useValue: {enableAutoSave: vi.fn()}},
        {provide: EditorService, useValue: {enableAutoValidation: vi.fn()}},
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
});
