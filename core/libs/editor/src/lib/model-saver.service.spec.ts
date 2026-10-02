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
  LoadedFilesService,
  ModelApiPort,
  ModelService,
  NamespaceFile,
  RdfPort,
  SammLanguageSettingsService,
} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelSaverService} from './model-saver.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';

describe('ModelSaverService', () => {
  let service: ModelSaverService;
  let modelApiService: ModelApiPort;
  let modelSavingTracker: ModelSavingTrackerService;
  let notificationsService: NotificationsService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelSaverService,
        MockProvider(MaxGraphService, {graphModelChanged$: new Subject<void>()}),
        MockProvider(ModelApiPort, {
          fetchFormatedAspectModel: vi.fn(() => of('formatted content')),
          saveAspectModel: vi.fn(() => of(null as any)),
          loadNamespacesStructure: vi.fn(() => of({})),
        }),
        MockProvider(RdfPort, {
          serializeModel: vi.fn(() => '@prefix : <urn:test#> .\n:Aspect a samm:Aspect .'),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
        MockProvider(ModelService, {
          synchronizeModelToRdf: vi.fn(() => of(undefined)),
        }),
        MockProvider(ModelSavingTrackerService, {
          updateSavedModel: vi.fn(),
        }),
        MockProvider(NotificationsService, {
          info: vi.fn(),
          error: vi.fn(),
        }),
        MockProvider(LanguageTranslationService, {
          language: {
            notificationService: {
              aspectSavedSuccess: 'Saved',
              aspectSavedError: 'Error',
              aspectSavedEmptyModel: 'Empty',
            },
          } as any,
        }),
        MockProvider(ConfigurationService, {
          getSettings: vi.fn(
            () =>
              ({
                copyrightHeader: ['# Copyright'],
                autoSaveEnabled: false,
                saveTimerSeconds: 60,
              }) as any,
          ),
        }),
        {
          provide: ConfigurationService,
          useFactory: () =>
            ({
              getSettings: vi.fn(() => ({
                copyrightHeader: ['# Copyright'],
                autoSaveEnabled: false,
                saveTimerSeconds: 60,
                editorTheme: 'light',
              })),
            }) as any,
        },
        {
          provide: SammLanguageSettingsService,
          useValue: {
            getSettings: vi.fn(() => ({
              languages: ['en'],
              defaultLanguage: 'en',
            })),
          },
        },
      ],
    });

    service = TestBed.inject(ModelSaverService);
    modelApiService = TestBed.inject(ModelApiPort);
    modelSavingTracker = TestBed.inject(ModelSavingTrackerService);
    notificationsService = TestBed.inject(NotificationsService);
  });

  it('saveModel should synchronize, format, save and notify', async () => {
    await new Promise(resolve => service.saveModel().subscribe(resolve));

    expect(modelApiService.fetchFormatedAspectModel).toHaveBeenCalled();
    expect(modelApiService.saveAspectModel).toHaveBeenCalled();
    expect(modelSavingTracker.updateSavedModel).toHaveBeenCalled();
    expect(notificationsService.info).toHaveBeenCalled();
  });
});
