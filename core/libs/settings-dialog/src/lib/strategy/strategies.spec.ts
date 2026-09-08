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
import {MaxGraphService, ThemeService} from '@ame/max-graph';
import {ElectronTunnelService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Settings, SettingsFormData} from '../model';
import {
  AutomatedWorkflowUpdateStrategy,
  CopyrightHeaderUpdateStrategy,
  EditorConfigurationUpdateStrategy,
  LanguageConfigurationUpdateStrategy,
  NamespaceConfigurationUpdateStrategy,
} from './index';

describe('Settings Update Strategies', () => {
  let initialSettings: Settings;
  let mockFormData: SettingsFormData;

  beforeEach(() => {
    initialSettings = {
      namespace: 'org.initial',
      version: '1.0.0',
      showEditorNav: true,
      showEditorMap: true,
      autoSaveEnabled: false,
      autoValidationEnabled: false,
      autoFormatEnabled: false,
      enableHierarchicalLayout: false,
      darkMode: false,
      validationTimerSeconds: 60,
      saveTimerSeconds: 60,
      showConnectionLabels: false,
      useSaturatedColors: false,
      copyrightHeader: [],
      aspectModelLanguages: ['en'],
      toolbarVisibility: true,
    };

    mockFormData = {
      automatedWorkflow: {
        autoSaveEnabled: true,
        saveTimerSeconds: 120,
        autoValidationEnabled: true,
        validationTimerSeconds: 300,
        autoFormatEnabled: true,
      },
      editorConfiguration: {
        enableHierarchicalLayout: true,
        showConnectionLabels: true,
        darkMode: true,
      },
      languageConfiguration: {
        userInterface: 'de',
        aspectModel: [{language: {name: 'German', tag: 'de'}}, {language: {name: 'English', tag: 'en'}}],
      },
      namespaceConfiguration: {
        aspectUri: 'org.eclipse.esmf',
        aspectName: 'TestAspect',
        aspectVersion: '2.0.0',
        sammVersion: '2.3.0',
      },
      copyrightHeaderConfiguration: {
        copyright: '# Line 1\n# Line 2',
      },
    };
  });

  describe('AutomatedWorkflowUpdateStrategy', () => {
    let strategy: AutomatedWorkflowUpdateStrategy;
    let modelSaverService: {enableAutoSave: ReturnType<typeof vi.fn>};
    let editorService: {enableAutoValidation: ReturnType<typeof vi.fn>};

    beforeEach(() => {
      modelSaverService = {enableAutoSave: vi.fn()};
      editorService = {enableAutoValidation: vi.fn()};

      TestBed.configureTestingModule({
        providers: [
          AutomatedWorkflowUpdateStrategy,
          {provide: ModelSaverService, useValue: modelSaverService},
          {provide: EditorService, useValue: editorService},
        ],
      });

      strategy = TestBed.inject(AutomatedWorkflowUpdateStrategy);
    });

    it('should update automated workflow settings and trigger services when enabled', () => {
      strategy.updateSettings(mockFormData, initialSettings);

      expect(initialSettings.autoSaveEnabled).toBe(true);
      expect(initialSettings.saveTimerSeconds).toBe(120);
      expect(initialSettings.autoValidationEnabled).toBe(true);
      expect(initialSettings.validationTimerSeconds).toBe(300);
      expect(initialSettings.autoFormatEnabled).toBe(true);

      expect(editorService.enableAutoValidation).toHaveBeenCalled();
      expect(modelSaverService.enableAutoSave).toHaveBeenCalled();
    });

    it('should handle missing automated workflow gracefully', () => {
      strategy.updateSettings({} as any, initialSettings);
      expect(editorService.enableAutoValidation).not.toHaveBeenCalled();
    });
  });

  describe('EditorConfigurationUpdateStrategy', () => {
    let strategy: EditorConfigurationUpdateStrategy;
    let maxGraphService: {formatShapes: ReturnType<typeof vi.fn>};
    let themeService: {applyTheme: ReturnType<typeof vi.fn>};

    beforeEach(() => {
      maxGraphService = {formatShapes: vi.fn()};
      themeService = {applyTheme: vi.fn()};

      TestBed.configureTestingModule({
        providers: [
          EditorConfigurationUpdateStrategy,
          {provide: MaxGraphService, useValue: maxGraphService},
          {provide: ThemeService, useValue: themeService},
        ],
      });

      strategy = TestBed.inject(EditorConfigurationUpdateStrategy);
    });

    it('should update editor configuration settings, theme and format shapes', () => {
      strategy.updateSettings(mockFormData, initialSettings);

      expect(initialSettings.enableHierarchicalLayout).toBe(true);
      expect(initialSettings.showConnectionLabels).toBe(true);
      expect(initialSettings.darkMode).toBe(true);
      expect(themeService.applyTheme).toHaveBeenCalledWith('dark');
      expect(maxGraphService.formatShapes).toHaveBeenCalledWith(true);
    });
  });

  describe('LanguageConfigurationUpdateStrategy', () => {
    let strategy: LanguageConfigurationUpdateStrategy;
    let translate: {translateService: {setActiveLang: ReturnType<typeof vi.fn>}};
    let electronTunnelService: {sendTranslationsToElectron: ReturnType<typeof vi.fn>};

    beforeEach(() => {
      translate = {translateService: {setActiveLang: vi.fn()}};
      electronTunnelService = {sendTranslationsToElectron: vi.fn()};

      TestBed.configureTestingModule({
        providers: [
          LanguageConfigurationUpdateStrategy,
          {provide: LanguageTranslationService, useValue: translate},
          {provide: ElectronTunnelService, useValue: electronTunnelService},
        ],
      });

      strategy = TestBed.inject(LanguageConfigurationUpdateStrategy);
    });

    it('should update active language, electron tunnel, and aspectModelLanguages', () => {
      strategy.updateSettings(mockFormData, initialSettings);

      expect(translate.translateService.setActiveLang).toHaveBeenCalledWith('de');
      expect(electronTunnelService.sendTranslationsToElectron).toHaveBeenCalledWith('de');
      expect(localStorage.getItem('applicationLanguage')).toBe('de');
      expect(initialSettings.aspectModelLanguages).toEqual(['de', 'en']);
    });
  });

  describe('NamespaceConfigurationUpdateStrategy', () => {
    let strategy: NamespaceConfigurationUpdateStrategy;
    let loadedFilesService: {
      currentLoadedFile: {absoluteName: string};
      updateAbsoluteName: ReturnType<typeof vi.fn>;
    };
    let titleService: {updateTitle: ReturnType<typeof vi.fn>};

    beforeEach(() => {
      loadedFilesService = {
        currentLoadedFile: {absoluteName: 'old-file.ttl'},
        updateAbsoluteName: vi.fn(),
      };
      titleService = {updateTitle: vi.fn()};

      TestBed.configureTestingModule({
        providers: [
          NamespaceConfigurationUpdateStrategy,
          {provide: LoadedFilesService, useValue: loadedFilesService},
          {provide: TitleService, useValue: titleService},
        ],
      });

      strategy = TestBed.inject(NamespaceConfigurationUpdateStrategy);
    });

    it('should update namespace, version, and absolute name', () => {
      strategy.updateSettings(mockFormData, initialSettings);

      expect(initialSettings.namespace).toBe('org.eclipse.esmf');
      expect(initialSettings.version).toBe('2.0.0');
      expect(loadedFilesService.updateAbsoluteName).toHaveBeenCalledWith('old-file.ttl', 'org.eclipse.esmf:2.0.0:TestAspect.ttl');
      expect(titleService.updateTitle).toHaveBeenCalledWith('old-file.ttl');
    });
  });

  describe('CopyrightHeaderUpdateStrategy', () => {
    let strategy: CopyrightHeaderUpdateStrategy;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [CopyrightHeaderUpdateStrategy],
      });
      strategy = TestBed.inject(CopyrightHeaderUpdateStrategy);
    });

    it('should split copyright lines and update settings', () => {
      strategy.updateSettings(mockFormData, initialSettings);
      expect(initialSettings.copyrightHeader).toEqual(['# Line 1', '# Line 2']);
    });

    it('should handle empty copyright string', () => {
      mockFormData.copyrightHeaderConfiguration.copyright = '';
      strategy.updateSettings(mockFormData, initialSettings);
      expect(initialSettings.copyrightHeader).toEqual([]);
    });
  });
});
