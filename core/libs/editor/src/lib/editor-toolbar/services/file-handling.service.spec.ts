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
import {RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {ConfigurationService} from '@ame/settings-dialog';
import {ElectronSignalsService, LoadingScreenService, ModelSavingTrackerService, NotificationsService, TitleService} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfirmDialogService} from '../../confirm-dialog/confirm-dialog.service';
import {ShapeSettingsStateService} from '../../editor-dialog/services/shape-settings-state.service';
import {EditorService} from '../../editor.service';
import {ModelLoaderService} from '../../model-loader.service';
import {ModelSaverService} from '../../model-saver.service';
import {FileHandlingService} from './file-handling.service';
import {FileUploadService} from './file-upload.service';

describe('FileHandlingService', () => {
  let service: FileHandlingService;
  let modelApiService: ModelApiService;
  let modelLoaderService: ModelLoaderService;
  let loadedFilesService: LoadedFilesService;
  let loadingScreenService: LoadingScreenService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileHandlingService,
        MockProvider(EditorService, {
          validate: vi.fn(() => of([])),
        }),
        MockProvider(ModelService, {
          synchronizeModelToRdf: vi.fn(() => of(undefined)),
        }),
        MockProvider(RdfService, {
          serializeModel: vi.fn(() => 'turtle content'),
        }),
        MockProvider(ModelApiService, {
          validate: vi.fn(() => of([])),
          fetchAspectMetaModel: vi.fn(() => of({content: 'model content', sourceLocation: ''} as any)),
          fetchFormatedAspectModel: vi.fn(() => of('formatted content')),
          loadNamespacesStructure: vi.fn(() => of({} as any)),
        }),
        MockProvider(ConfirmDialogService),
        MockProvider(NotificationsService, {
          error: vi.fn(),
          info: vi.fn(),
          success: vi.fn(),
        }),
        MockProvider(LoadingScreenService, {
          open: vi.fn(),
          close: vi.fn(),
        }),
        MockProvider(SidebarStateService, {
          workspace: {close: vi.fn(), refresh: vi.fn()} as any,
          sammElements: {open: vi.fn()} as any,
        }),
        MockProvider(LanguageTranslationService, {
          language: {
            notificationDialog: {LOADING: 'Loading', CONTENT: 'Wait', VALIDATING: 'Validating'},
            notificationService: {loadingError: 'Error'},
            loadingScreenDialog: {aspectModelLoading: 'Loading', generalWaitMessage: 'Wait'},
          } as any,
          translateService: {translate: vi.fn(() => '')} as any,
        }),
        MockProvider(ElectronSignalsService, {call: vi.fn()}),
        MockProvider(ConfigurationService, {
          getSettings: vi.fn(() => ({copyrightHeader: ['# Header']}) as any),
        }),
        MockProvider(ModelSavingTrackerService, {
          updateSavedModel: vi.fn(),
        }),
        MockProvider(FileUploadService),
        MockProvider(ShapeSettingsStateService, {
          closeShapeSettings: vi.fn(),
        }),
        MockProvider(MaxGraphService, {
          deleteAllShapes: vi.fn(),
        }),
        MockProvider(ModelLoaderService, {
          renderModel: vi.fn(() => of(null as any)),
          createRdfModelFromContent: vi.fn(() => of(new NamespaceFile(new RdfModel(new Store()), new ModelElementCache(), null))),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
          removeAll: vi.fn(),
          addFile: vi.fn(),
        }),
        MockProvider(ModelSaverService),
        MockProvider(TitleService, {updateTitle: vi.fn()}),
        MockProvider(RdfNodeService),
      ],
    });

    service = TestBed.inject(FileHandlingService);
    modelApiService = TestBed.inject(ModelApiService);
    modelLoaderService = TestBed.inject(ModelLoaderService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
    loadingScreenService = TestBed.inject(LoadingScreenService);
  });

  it('loadModel should validate and render model', async () => {
    await new Promise(resolve => service.loadModel('valid turtle content').subscribe(resolve));

    expect(modelApiService.validate).toHaveBeenCalledWith('valid turtle content');
    expect(modelLoaderService.renderModel).toHaveBeenCalled();
    expect(loadingScreenService.close).toHaveBeenCalled();
  });

  it('loadEmptyModel should reset loaded files and initialize empty model', async () => {
    await new Promise(resolve => service.loadEmptyModel().subscribe(resolve));

    expect(loadedFilesService.removeAll).toHaveBeenCalled();
    expect(loadedFilesService.addFile).toHaveBeenCalled();
  });

  it('loadNamespaceFile should fetch aspect meta model and render', () => {
    service.loadNamespaceFile('com.example:1.0.0:test.ttl', 'urn:samm:com.example:1.0.0#Aspect');

    expect(modelApiService.fetchAspectMetaModel).toHaveBeenCalledWith('urn:samm:com.example:1.0.0#Aspect');
    expect(modelLoaderService.renderModel).toHaveBeenCalled();
  });
});
