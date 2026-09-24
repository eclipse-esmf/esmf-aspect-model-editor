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

import {LoadedFilesService} from '@ame/infrastructure';
import {
  AlertService,
  EDITOR_VALIDATION_SERVICE,
  LanguageTranslationService,
  LoadingScreenService,
  MAX_GRAPH_SETTINGS_SERVICE,
  MODEL_SAVER_TOKEN_SERVICE,
  TAURI_TUNNEL_SERVICE,
  TitleService,
} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfigurationService, SammLanguageSettingsService, SettingsFormService} from '../../services';
import {SettingDialogComponent} from './setting-dialog.component';

describe('SettingDialogComponent', () => {
  let component: SettingDialogComponent;
  let fixture: ComponentFixture<SettingDialogComponent>;
  let formService: SettingsFormService;
  let dialogRef: {close: ReturnType<typeof vi.fn>};
  let alertService: {open: ReturnType<typeof vi.fn>};
  let loadingScreen: {open: ReturnType<typeof vi.fn>};
  let maxGraphSettingsService: {
    formatShapes: ReturnType<typeof vi.fn>;
    updateGraph: ReturnType<typeof vi.fn>;
    removeUnnecessaryLanguages: ReturnType<typeof vi.fn>;
  };
  let loadedFilesService: {
    currentLoadedFile: any;
    updateAbsoluteName: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.clear();

    dialogRef = {close: vi.fn()};
    alertService = {open: vi.fn()};
    loadingScreen = {open: vi.fn(() => ({close: vi.fn()}))};
    maxGraphSettingsService = {
      formatShapes: vi.fn(),
      updateGraph: vi.fn((cb: () => void) => cb?.()),
      removeUnnecessaryLanguages: vi.fn(),
    };

    const mockCachedFile = {
      updateElementsNamespace: vi.fn(),
    };
    const mockRdfModel = {
      updatePrefix: vi.fn(),
      getNamespaces: vi.fn(() => ({})),
    };

    loadedFilesService = {
      currentLoadedFile: {
        absoluteName: 'urn:samm:org.eclipse.esmf:1.0.0:Aspect.ttl',
        namespace: 'org.eclipse.esmf:1.0.0',
        cachedFile: mockCachedFile,
        rdfModel: mockRdfModel,
        aspect: {},
      },
      updateAbsoluteName: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        SettingDialogComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              settingsDialog: {
                title: 'Settings',
                cancel: 'Cancel',
                apply: 'Apply',
                ok: 'OK',
                errorMessage: 'Form is invalid',
                node: {systemConfiguration: 'System Configuration', modelConfiguration: 'Model Configuration'},
                subNode: {
                  automatedWorkflow: 'Automated Workflow',
                  editor: 'Editor',
                  languages: 'Languages',
                  namespaces: 'Namespaces',
                  copyright: 'Copyright',
                },
                configuration: {},
                languages: {chooseLanguage: 'Choose', userInterface: 'UI', selectLanguage: 'Select', addLanguage: 'Add'},
                namespaces: {
                  aspectNamespaceTooltip: 'Tooltip',
                  value: 'Value',
                  version: 'Version',
                  name: 'Name',
                  sammVersion: 'SAMM',
                  predefinedNamespaces: 'Predefined',
                },
              },
            },
          },
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
      ],
      providers: [
        SettingsFormService,
        ConfigurationService,
        SammLanguageSettingsService,
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: AlertService, useValue: alertService},
        {provide: LoadingScreenService, useValue: loadingScreen},
        {provide: MAX_GRAPH_SETTINGS_SERVICE, useValue: maxGraphSettingsService},
        {provide: LoadedFilesService, useValue: loadedFilesService},
        {
          provide: LanguageTranslationService,
          useValue: {
            supportedLanguages: [{code: 'en', language: 'English'}],
            translateService: {getActiveLang: () => 'en', setActiveLang: vi.fn()},
          },
        },
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: TAURI_TUNNEL_SERVICE, useValue: {sendTranslationsToTauri: vi.fn()}},
        {provide: MODEL_SAVER_TOKEN_SERVICE, useValue: {enableAutoSave: vi.fn()}},
        {provide: EDITOR_VALIDATION_SERVICE, useValue: {enableAutoValidation: vi.fn()}},
      ],
    }).compileComponents();

    formService = TestBed.inject(SettingsFormService);
    fixture = TestBed.createComponent(SettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize tree and form', () => {
    expect(component).toBeTruthy();
    expect(component.selectedNodeType).toBe(component.NodeNames.AUTOMATED_WORKFLOW);
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should change node selection on onNodeSelected', () => {
    component.onNodeSelected(component.NodeNames.CONFIGURATION);
    expect(component.selectedNodeType).toBe(component.NodeNames.AUTOMATED_WORKFLOW);

    component.onNodeSelected(component.NodeNames.MODEL_CONFIGURATION);
    expect(component.selectedNodeType).toBe(component.NodeNames.LANGUAGES);

    component.onNodeSelected(component.NodeNames.NAMESPACES);
    expect(component.selectedNodeType).toBe(component.NodeNames.NAMESPACES);
  });

  it('should close dialog on cancel or close', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);

    component.onClose();
    expect(dialogRef.close).toHaveBeenCalledTimes(2);
  });

  it('should apply settings and close on onOk', () => {
    const updateSpy = vi.spyOn(formService, 'updateSettings');
    component.onOk();
    expect(updateSpy).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should prompt confirm box if languages are marked for removal', () => {
    formService.addLanguageToBeRemove('de');
    component.applySettings();
    expect(alertService.open).toHaveBeenCalled();
  });

  it('should not prompt confirm box on onOk if languages were already confirmed via applySettings', () => {
    formService.addLanguageToBeRemove('de');

    // Simulate clicking Apply
    component.applySettings();
    expect(alertService.open).toHaveBeenCalledTimes(1);

    // Simulate user confirming (clicking Continue)
    const alertCallArgs = alertService.open.mock.calls[0][0];
    alertCallArgs.data.rightButtonAction();

    expect(formService.getLanguagesToBeRemove().length).toBe(0);

    // Now clicking OK should not prompt again
    component.onOk();
    expect(alertService.open).toHaveBeenCalledTimes(1); // Still 1, not called again
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should prompt confirm box on onOk directly if languages are marked for removal and apply was not clicked', () => {
    formService.addLanguageToBeRemove('de');

    component.onOk();
    expect(alertService.open).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).not.toHaveBeenCalled();

    // When user confirms, dialog closes
    const alertCallArgs = alertService.open.mock.calls[0][0];
    alertCallArgs.data.rightButtonAction();

    expect(dialogRef.close).toHaveBeenCalled();
    expect(formService.getLanguagesToBeRemove().length).toBe(0);
  });

  it('should handle namespace changes during applySettings', () => {
    formService.setNamespace('org.old');
    formService.setVersion('1.0.0');

    formService.settingsModel.update(m => ({
      ...m,
      namespaceConfiguration: {
        ...m.namespaceConfiguration,
        aspectUri: 'org.new',
        aspectVersion: '2.0.0',
      },
    }));

    component.applySettings();

    expect(loadedFilesService.currentLoadedFile.cachedFile.updateElementsNamespace).toHaveBeenCalled();
    expect(loadedFilesService.currentLoadedFile.rdfModel.updatePrefix).toHaveBeenCalled();
  });

  it('should validate node invalid status with isNodeInvalid', () => {
    expect(component.isNodeInvalid({id: 'automatedWorkflow'} as any)).toBe(false);
    expect(component.isNodeInvalid({id: 'unknownNode'} as any)).toBe(false);

    // Make namespace invalid
    formService.settingsModel.update(m => ({
      ...m,
      namespaceConfiguration: {
        ...m.namespaceConfiguration,
        aspectUri: 'invalid uri spaces',
      },
    }));

    expect(component.isNodeInvalid({id: 'namespaceConfiguration'} as any)).toBe(true);
    expect(component.isNodeInvalid({id: 'modelConfiguration'} as any)).toBe(true);
  });
});
