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
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfigurationService, SammLanguageSettingsService, SettingsFormService} from '../../../services';
import {HeaderCopyrightComponent} from './header-copyright.component';

describe('HeaderCopyrightComponent', () => {
  let component: HeaderCopyrightComponent;
  let fixture: ComponentFixture<HeaderCopyrightComponent>;
  let formService: SettingsFormService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [
        HeaderCopyrightComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {en: {settingsDialog: {subNode: {copyright: 'Copyright'}}}},
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
          useValue: {translateService: {getActiveLang: () => 'en', setActiveLang: vi.fn()}},
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

    fixture = TestBed.createComponent(HeaderCopyrightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and bind copyright form', () => {
    expect(component).toBeTruthy();
    expect(component.form.copyrightHeaderConfiguration).toBeDefined();
  });
});
