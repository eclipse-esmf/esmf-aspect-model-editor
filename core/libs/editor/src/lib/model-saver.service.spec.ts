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
  ModelDocumentService,
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
import {Subject, of, throwError} from 'rxjs';
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
        MockProvider(ModelDocumentService, {
          toDocument: vi.fn((formatted: string) => `# file header\n\n${formatted}`),
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
          translateService: {translate: vi.fn((key: string, params?: any) => (params ? `${key} ${JSON.stringify(params)}` : key))} as any,
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

  it('saveModel should name the missing elements if the model references undefined elements', async () => {
    const elements = ['urn:samm:org.gone:1.0.0#missingProp', 'urn:samm:org.gone:1.0.0#MissingChar'];
    vi.mocked(modelApiService.fetchFormatedAspectModel).mockReturnValue(
      throwError(() => ({
        status: 409,
        error: {code: 409, message: "Element '...' does not exist in a file.", unresolvedElements: elements},
      })),
    );

    await new Promise(resolve => service.saveModel().subscribe(resolve));

    expect(notificationsService.error).toHaveBeenCalledWith({
      title: 'notificationService.unresolvedReferencesTitle',
      message: `notificationService.unresolvedReferencesSaveMessage ${JSON.stringify({elements: elements.join(', ')})}`,
    });
    expect(modelApiService.saveAspectModel).not.toHaveBeenCalled();
  });

  it('saveModel should show the backend message for other errors', async () => {
    vi.mocked(modelApiService.saveAspectModel).mockReturnValue(throwError(() => ({status: 409, error: {message: 'Syntax error'}})));

    await new Promise(resolve => service.saveModel().subscribe(resolve));

    expect(notificationsService.error).toHaveBeenCalledWith({title: 'Error', message: 'Syntax error'});
  });

  it('saveModel should save the formatted model as document with the header and order of the loaded file', async () => {
    const modelDocumentService = TestBed.inject(ModelDocumentService);
    const loadedFilesService = TestBed.inject(LoadedFilesService);

    await new Promise(resolve => service.saveModel().subscribe(resolve));

    expect(modelDocumentService.toDocument).toHaveBeenCalledWith('formatted content', loadedFilesService.currentLoadedFile?.rdfModel);
    expect(vi.mocked(modelApiService.saveAspectModel).mock.calls[0][0]).toBe('# file header\n\nformatted content');
  });
});
