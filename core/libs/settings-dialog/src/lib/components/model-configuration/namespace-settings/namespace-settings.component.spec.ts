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
import {Samm} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfigurationService, SammLanguageSettingsService, SettingsFormService} from '../../../services';
import {NamespaceSettingsComponent} from './namespace-settings.component';

describe('NamespaceSettingsComponent', () => {
  let component: NamespaceSettingsComponent;
  let fixture: ComponentFixture<NamespaceSettingsComponent>;
  let formService: SettingsFormService;

  beforeEach(async () => {
    localStorage.clear();

    const mockRdfModel = {
      getNamespaces: vi.fn(() => ({
        xsd: Samm.XSD_URI,
        rdf: Samm.RDF_URI,
        rdfs: Samm.RDFS_URI,
        custom: 'urn:samm:org.eclipse.esmf:custom:1.0.0#',
      })),
    };

    await TestBed.configureTestingModule({
      imports: [
        NamespaceSettingsComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              settingsDialog: {
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
        {
          provide: LoadedFilesService,
          useValue: {
            currentLoadedFile: {
              absoluteName: 'org.esmf:1.0.0:Aspect.ttl',
              rdfModel: mockRdfModel,
            },
          },
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

    fixture = TestBed.createComponent(NamespaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and map predefined namespaces', () => {
    expect(component).toBeTruthy();
    const predefined = component.predefinedNamespaces();
    expect(predefined.length).toBeGreaterThan(0);
    expect(predefined.some(ns => ns.name === 'xsd')).toBe(true);
    expect(predefined.some(ns => ns.name === 'rdf')).toBe(true);
    expect(predefined.some(ns => ns.name === 'rdfs')).toBe(true);
  });

  it('should toggle panelOpenState', () => {
    expect(component.panelOpenState()).toBe(false);
    component.panelOpenState.set(true);
    expect(component.panelOpenState()).toBe(true);
  });
});
