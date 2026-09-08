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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ModelService, RdfSerializerService} from '@ame/rdf/services';
import {ConfigurationService} from '@ame/settings-dialog';
import {ModelSavingTrackerService, NotificationsService} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FileHandlingService} from './editor-toolbar/services/file-handling.service';
import {ModelSaverService} from './model-saver.service';

describe('ModelSaverService', () => {
  let service: ModelSaverService;
  let modelApiService: ModelApiService;
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
        MockProvider(ModelApiService, {
          fetchFormatedAspectModel: vi.fn(() => of('formatted content')),
          saveAspectModel: vi.fn(() => of(null as any)),
        }),
        MockProvider(RdfSerializerService, {
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
        MockProvider(SidebarStateService, {
          workspace: {refresh: vi.fn()} as any,
        }),
        MockProvider(FileHandlingService, {
          isFileExistOnWorkspace: vi.fn(() => of(false)),
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
      ],
    });

    service = TestBed.inject(ModelSaverService);
    modelApiService = TestBed.inject(ModelApiService);
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
