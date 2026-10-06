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
import {AlertService, LanguageTranslationService, LoadingScreenService, TauriTunnelPort, TitleService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SettingsFormService} from '../../services';
import {SETTINGS_LAST_SECTION_KEY, SettingDialogComponent} from './setting-dialog.component';

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
                configuration: {darkMode: 'Dark mode', autoSave: 'Auto-save', restoreSession: 'Restore open models on start'},
                description: {
                  automatedWorkflow: 'Automatic saving',
                  editor: 'Appearance of the graph',
                  languages: 'Language of the user interface',
                  namespaces: 'Namespace and version',
                  copyright: 'Comment header',
                },
                search: {placeholder: 'Search settings', noResults: 'No matching settings', clear: 'Clear'},
                unsavedChanges: {
                  badge: 'Unsaved changes',
                  title: 'Discard changes?',
                  content: 'Changes',
                  keepEditing: 'Keep',
                  discard: 'Discard',
                },
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
        {provide: GraphSettingsPort, useValue: maxGraphSettingsService},
        {provide: ModelSessionFacade, useValue: loadedFilesService},
        {
          provide: LanguageTranslationService,
          useValue: {
            supportedLanguages: [{code: 'en', language: 'English'}],
            translateService: {getActiveLang: () => 'en', setActiveLang: vi.fn()},
          },
        },
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: TauriTunnelPort, useValue: {sendTranslationsToTauri: vi.fn()}},
        {provide: ModelSaverPort, useValue: {enableAutoSave: vi.fn()}},
        {provide: EditorValidationPort, useValue: {enableAutoValidation: vi.fn()}},
      ],
    }).compileComponents();

    formService = TestBed.inject(SettingsFormService);
    fixture = TestBed.createComponent(SettingDialogComponent);
    component = fixture.componentInstance;
    // The shared (x) button routes through the dialog's requestClose() like the real MatDialogRef.
    (dialogRef as {componentInstance?: unknown}).componentInstance = component;
    fixture.detectChanges();
  });

  function recreate(): void {
    fixture.destroy();
    fixture = TestBed.createComponent(SettingDialogComponent);
    component = fixture.componentInstance;
    (dialogRef as {componentInstance?: unknown}).componentInstance = component;
    fixture.detectChanges();
  }

  function element(testId: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  }

  function makeDirty(): void {
    formService.settingsModel.update(m => ({
      ...m,
      editorConfiguration: {...m.editorConfiguration, darkMode: !m.editorConfiguration.darkMode},
    }));
    fixture.detectChanges();
  }

  it('should create with both setting groups and select the first section', () => {
    expect(component).toBeTruthy();
    expect(component.groups.map(group => group.id)).toEqual(['systemConfiguration', 'modelConfiguration']);
    expect(component.selectedSectionId()).toBe('automatedWorkflow');
    expect(fixture.nativeElement.querySelectorAll('[role="treeitem"]').length).toBe(5);
  });

  it('should change the section on selectSection and remember it', () => {
    component.selectSection('namespaceConfiguration');
    fixture.detectChanges();

    expect(component.selectedSectionId()).toBe('namespaceConfiguration');
    expect(localStorage.getItem(SETTINGS_LAST_SECTION_KEY)).toBe('namespaceConfiguration');
    expect(element('settings-node-namespaceConfiguration')?.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('ame-namespace')).toBeTruthy();
  });

  it('should reopen the last opened section and ignore unknown stored values', () => {
    localStorage.setItem(SETTINGS_LAST_SECTION_KEY, 'copyrightHeaderConfiguration');
    recreate();
    expect(component.selectedSectionId()).toBe('copyrightHeaderConfiguration');

    localStorage.setItem(SETTINGS_LAST_SECTION_KEY, 'unknown');
    recreate();
    expect(component.selectedSectionId()).toBe('automatedWorkflow');
  });

  it('should select a section with click, Enter and Space', () => {
    element('settings-node-editorConfiguration')!.click();
    expect(component.selectedSectionId()).toBe('editorConfiguration');

    element('settings-node-languageConfiguration')!.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
    expect(component.selectedSectionId()).toBe('languageConfiguration');

    element('settings-node-copyrightHeaderConfiguration')!.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}));
    expect(component.selectedSectionId()).toBe('copyrightHeaderConfiguration');
  });

  it('should move through the sections with the arrow keys, Home and End', () => {
    const tree = fixture.nativeElement.querySelector('[role="tree"]') as HTMLElement;
    const press = (key: string) => tree.dispatchEvent(new KeyboardEvent('keydown', {key, cancelable: true}));

    press('ArrowDown');
    expect(component.selectedSectionId()).toBe('editorConfiguration');
    press('ArrowDown');
    expect(component.selectedSectionId()).toBe('languageConfiguration');
    press('ArrowUp');
    expect(component.selectedSectionId()).toBe('editorConfiguration');
    press('End');
    expect(component.selectedSectionId()).toBe('copyrightHeaderConfiguration');
    press('ArrowDown');
    expect(component.selectedSectionId()).toBe('copyrightHeaderConfiguration');
    press('Home');
    expect(component.selectedSectionId()).toBe('automatedWorkflow');
    press('ArrowUp');
    expect(component.selectedSectionId()).toBe('automatedWorkflow');
  });

  it('should use a roving tabindex on the tree items', () => {
    component.selectSection('languageConfiguration');
    fixture.detectChanges();
    const items = Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
    expect(items.map(item => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0', '-1', '-1']);
  });

  it('should filter the sections by labels inside the section and select the first match', () => {
    component.onSearch('dark');
    fixture.detectChanges();

    expect(component.visibleSections().map(section => section.id)).toEqual(['editorConfiguration']);
    expect(component.selectedSectionId()).toBe('editorConfiguration');
    expect(fixture.nativeElement.querySelectorAll('[role="treeitem"]').length).toBe(1);
  });

  it('should match group names, section titles and descriptions case-insensitively', () => {
    component.onSearch('MODEL CONFIGURATION');
    expect(component.visibleSections().map(section => section.id)).toEqual([
      'languageConfiguration',
      'namespaceConfiguration',
      'copyrightHeaderConfiguration',
    ]);

    component.onSearch('comment header');
    expect(component.visibleSections().map(section => section.id)).toEqual(['copyrightHeaderConfiguration']);
  });

  it('should keep the selection when it still matches and show a hint without results', () => {
    component.selectSection('editorConfiguration');
    component.onSearch('restore');
    expect(component.selectedSectionId()).toBe('editorConfiguration');

    component.onSearch('does-not-exist');
    fixture.detectChanges();
    expect(component.visibleGroups()).toEqual([]);
    expect(element('settings-no-results')).toBeTruthy();
    expect(component.selectedSectionId()).toBe('editorConfiguration');

    component.clearSearch();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="treeitem"]').length).toBe(5);
  });

  it('should show a section header with title, scope and description', () => {
    expect(element('settings-section-header')?.textContent).toContain('Automated Workflow');
    expect(element('settings-section-description')?.textContent).toContain('Automatic saving');
    expect(element('settings-scope')?.textContent).toContain('settingsDialog.scope.application');

    component.selectSection('copyrightHeaderConfiguration');
    fixture.detectChanges();
    expect(element('settings-scope')?.textContent).toContain('settingsDialog.scope.model');
  });

  it('should offer "reset to defaults" only for application sections and restore the defaults', () => {
    formService.settingsModel.update(m => ({
      ...m,
      automatedWorkflow: {...m.automatedWorkflow, saveTimerSeconds: 999, autoSaveEnabled: false},
      editorConfiguration: {...m.editorConfiguration, darkMode: true},
    }));
    fixture.detectChanges();

    element('settings-reset-section')!.click();
    expect(formService.settingsModel().automatedWorkflow.saveTimerSeconds).toBe(60);
    expect(formService.settingsModel().automatedWorkflow.autoSaveEnabled).toBe(true);
    expect(formService.settingsModel().editorConfiguration.darkMode).toBe(true);

    component.selectSection('namespaceConfiguration');
    fixture.detectChanges();
    expect(element('settings-reset-section')).toBeNull();
    component.resetSelectedSection();
    expect(formService.settingsModel().namespaceConfiguration.aspectUri).toBe('org.eclipse.esmf');
  });

  it('should show the dirty state and enable Apply only with changes', () => {
    const apply = element('settingsDialogApplyButton') as HTMLButtonElement;
    expect(component.isDirty).toBe(false);
    expect(element('settings-dirty-indicator')).toBeNull();
    expect(apply.disabled).toBe(true);

    makeDirty();
    expect(component.isDirty).toBe(true);
    expect(element('settings-dirty-indicator')).toBeTruthy();
    expect(apply.disabled).toBe(false);

    makeDirty();
    expect(component.isDirty).toBe(false);
  });

  it('should be pristine again after applying', () => {
    makeDirty();
    component.applySettings();
    fixture.detectChanges();
    expect(component.isDirty).toBe(false);
    expect((element('settingsDialogApplyButton') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should use the shared (x) button in the top right corner like every other dialog', () => {
    const close = element('settingsModalCloseButton')!;
    expect(close.classList.contains('close-button')).toBe(true);
    expect(close.closest('ame-dialog-close-button')).not.toBeNull();
    expect(close.getAttribute('aria-label')).toBeTruthy();
  });

  it('should render the title as a regular dialog title', () => {
    const title = fixture.nativeElement.querySelector('h2[mat-dialog-title]') as HTMLElement;
    expect(title).not.toBeNull();
    expect(title.parentElement?.classList.contains('settings__header')).toBe(false);
  });

  it('should close without asking when nothing changed', () => {
    component.requestClose();
    expect(alertService.open).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should ask before discarding unsaved changes via (x) or Escape', () => {
    makeDirty();
    element('settingsModalCloseButton')!.click();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(alertService.open).toHaveBeenCalledTimes(1);
    const options = alertService.open.mock.calls[0][0].data;
    expect(options.title).toBe('Discard changes?');
    expect(options.hasLeftButton).toBe(true);

    options.rightButtonAction();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should discard changes without asking on Cancel', () => {
    makeDirty();
    element('settingsDialogCancelButton')!.click();
    expect(alertService.open).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should mark invalid sections and jump to the first invalid section', () => {
    formService.settingsModel.update(m => ({
      ...m,
      copyrightHeaderConfiguration: {copyright: 'no hash'},
    }));
    fixture.detectChanges();

    expect(component.isSectionInvalid('copyrightHeaderConfiguration')).toBe(true);
    expect(element('settings-node-copyrightHeaderConfiguration')?.querySelector('[data-testid="settings-node-error"]')).toBeTruthy();
    expect(component.firstInvalidSection?.id).toBe('copyrightHeaderConfiguration');
    expect((element('settingsDialogOkButton') as HTMLButtonElement).disabled).toBe(true);

    element('settings-error-summary')!.click();
    expect(component.selectedSectionId()).toBe('copyrightHeaderConfiguration');
  });

  describe('without a loaded model', () => {
    beforeEach(() => {
      loadedFilesService.currentLoadedFile = undefined;
      recreate();
    });

    it('should not block saving because of the empty namespace', () => {
      expect(formService.hasLoadedModel()).toBe(false);
      expect(component.settingsForm().invalid()).toBe(false);
      expect((element('settingsDialogOkButton') as HTMLButtonElement).disabled).toBe(false);
    });

    it('should show the namespace section as "requires a loaded model" with disabled fields', () => {
      expect(element('settings-node-namespaceConfiguration')?.querySelector('[data-testid="settings-node-requires-model"]')).toBeTruthy();

      component.selectSection('namespaceConfiguration');
      fixture.detectChanges();
      expect(element('settings-requires-model-hint')).toBeTruthy();
      expect(component.settingsForm.namespaceConfiguration.aspectUri().disabled()).toBe(true);
      expect(element('settings-scope')?.textContent).toContain('settingsDialog.scope.noModel');
    });

    it('should apply the application settings without touching the namespace', () => {
      makeDirty();
      component.onOk();
      expect(loadedFilesService.updateAbsoluteName).not.toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();
    });
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

  it('should validate the section state with isSectionInvalid and isGroupInvalid', () => {
    expect(component.isSectionInvalid('automatedWorkflow')).toBe(false);

    formService.settingsModel.update(m => ({
      ...m,
      namespaceConfiguration: {
        ...m.namespaceConfiguration,
        aspectUri: 'invalid uri spaces',
      },
    }));

    expect(component.isSectionInvalid('namespaceConfiguration')).toBe(true);
    expect(component.isGroupInvalid(component.groups[1])).toBe(true);
    expect(component.isGroupInvalid(component.groups[0])).toBe(false);
  });
});
