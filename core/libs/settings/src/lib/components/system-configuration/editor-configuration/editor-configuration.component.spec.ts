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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SettingsFormService} from '../../../services';
import {EditorConfigurationComponent} from './editor-configuration.component';

describe('EditorConfigurationComponent', () => {
  let component: EditorConfigurationComponent;
  let fixture: ComponentFixture<EditorConfigurationComponent>;
  let formService: SettingsFormService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [
        EditorConfigurationComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {en: {settingsDialog: {subNode: {editor: 'Editor'}, configuration: {}}}},
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
      ],
      providers: [
        SettingsFormService,
        ConfigurationService,
        SammLanguageSettingsService,
        {
          provide: ModelSessionFacade,
          useValue: {currentLoadedFile: {absoluteName: 'org.esmf:1.0.0:Aspect.ttl'}},
        },
        {
          provide: LanguageTranslationService,
          useValue: {translateService: {getActiveLang: () => 'en', setActiveLang: vi.fn()}},
        },
        {provide: TitleService, useValue: {updateTitle: vi.fn()}},
        {provide: TauriTunnelPort, useValue: {sendTranslationsToTauri: vi.fn()}},
        {provide: GraphSettingsPort, useValue: {formatShapes: vi.fn()}},
        {provide: ModelSaverPort, useValue: {enableAutoSave: vi.fn()}},
        {provide: EditorValidationPort, useValue: {enableAutoValidation: vi.fn()}},
      ],
    }).compileComponents();

    formService = TestBed.inject(SettingsFormService);
    formService.initializeForm();

    fixture = TestBed.createComponent(EditorConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and bind form', () => {
    expect(component).toBeTruthy();
    expect(component.form.editorConfiguration).toBeDefined();
  });
});
