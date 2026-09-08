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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfigurationService, SammLanguageSettingsService, SettingsFormService} from '../../../services';
import {LanguageSettingsComponent} from './language-settings.component';

describe('LanguageSettingsComponent', () => {
  let component: LanguageSettingsComponent;
  let fixture: ComponentFixture<LanguageSettingsComponent>;
  let formService: SettingsFormService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [
        LanguageSettingsComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              settingsDialog: {
                subNode: {languages: 'Languages'},
                languages: {userInterface: 'UI', chooseLanguage: 'Choose', selectLanguage: 'Select', addLanguage: 'Add'},
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
        {
          provide: LoadedFilesService,
          useValue: {currentLoadedFile: {absoluteName: 'org.esmf:1.0.0:Aspect.ttl'}},
        },
        {
          provide: LanguageTranslationService,
          useValue: {
            supportedLanguages: [
              {code: 'en', language: 'English'},
              {code: 'de', language: 'German'},
            ],
            translateService: {getActiveLang: () => 'en', setActiveLang: vi.fn()},
          },
        },
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: ElectronTunnelService, useValue: {sendTranslationsToElectron: vi.fn()}},
        {provide: MaxGraphService, useValue: {formatShapes: vi.fn()}},
        {provide: ModelSaverService, useValue: {enableAutoSave: vi.fn()}},
        {provide: EditorService, useValue: {enableAutoValidation: vi.fn()}},
      ],
    }).compileComponents();

    formService = TestBed.inject(SettingsFormService);
    formService.initializeForm();

    fixture = TestBed.createComponent(LanguageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and provide supported languages', () => {
    expect(component).toBeTruthy();
    expect(component.supportedLanguages.length).toBe(2);
  });

  it('should add and remove languages', () => {
    const initialCount = component.aspectModelLanguages.length;
    component.addLanguage();
    expect(component.aspectModelLanguages.length).toBe(initialCount + 1);

    component.removeLanguage(component.aspectModelLanguages.length - 1);
    expect(component.aspectModelLanguages.length).toBe(initialCount);
  });

  it('should filter language options correctly', () => {
    expect(component.filterOptions('')).toEqual([]);
    expect(component.filterOptions(null)).toEqual([]);

    const results = component.filterOptions('German');
    expect(results.some(r => r.tag === 'de')).toBe(true);

    const resultsByTag = component.filterOptions('de');
    expect(resultsByTag.some(r => r.tag === 'de')).toBe(true);
  });

  it('should display language with tag formatted correctly', () => {
    expect(component.displayLanguageWithTag(null)).toBe('');
    expect(component.displayLanguageWithTag({name: 'German', tag: 'de'})).toContain('de');
    expect(component.displayLanguageWithTag('de')).toContain('de');
  });

  it('should handle onLanguageInput and onOptionSelected', () => {
    component.addLanguage();
    const index = component.aspectModelLanguages.length - 1;

    component.onLanguageInput(index, {target: {value: 'ger'}} as any);
    expect(component.aspectModelLanguages[index].language).toBe('ger');

    const mockEvent = {option: {value: {name: 'German', tag: 'de'}}} as MatAutocompleteSelectedEvent;
    component.onOptionSelected(index, mockEvent);
    expect(component.aspectModelLanguages[index].language).toEqual({name: 'German', tag: 'de'});
  });
});
