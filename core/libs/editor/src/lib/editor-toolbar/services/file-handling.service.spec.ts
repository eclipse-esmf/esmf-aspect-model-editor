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

import {ConfigurationService, LoadedFilesService, ModelApiPort, ModelService, NamespaceFile, RdfNodePort, RdfPort} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {
  IPC_RENDERER,
  LanguageTranslationService,
  LoadingScreenService,
  NotificationsService,
  TauriSignalsService,
  TitleService,
} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfirmDialogService} from '../../confirm-dialog/confirm-dialog.service';
import {ShapeSettingsStateService} from '../../editor-dialog/services/shape-settings-state.service';
import {EditorService} from '../../editor.service';
import {ModelLoaderService} from '../../model-loader.service';
import {ModelOpenerService} from '../../model-opener/model-opener.service';
import {ModelSaverService} from '../../model-saver.service';
import {ModelSavingTrackerService} from '../../model-saving-tracker.service';
import {ConfirmDialogEnum} from '../../models/confirm-dialog.enum';
import {TabStateService} from '../../tabs/tab-state.service';
import {FileHandlingService} from './file-handling.service';
import {FileUploadService} from './file-upload.service';

describe('FileHandlingService', () => {
  let service: FileHandlingService;
  let modelApiService: ModelApiPort;
  let modelLoaderService: ModelLoaderService;
  let loadedFilesService: LoadedFilesService;
  let loadingScreenService: LoadingScreenService;
  let notificationsService: NotificationsService;
  let copyToClipboardMock: ReturnType<typeof vi.fn>;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    copyToClipboardMock = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        FileHandlingService,
        {provide: IPC_RENDERER, useValue: {copyToClipboard: copyToClipboardMock}},
        MockProvider(EditorService, {
          validate: vi.fn(() => of([])),
        }),
        MockProvider(ModelService, {
          synchronizeModelToRdf: vi.fn(() => of(undefined)),
        }),
        MockProvider(RdfPort, {
          serializeModel: vi.fn(() => 'turtle content'),
        }),
        MockProvider(ModelApiPort, {
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
        MockProvider(LanguageTranslationService, {
          language: {
            notificationDialog: {LOADING: 'Loading', CONTENT: 'Wait', VALIDATING: 'Validating'},
            notificationService: {loadingError: 'Error'},
            loadingScreenDialog: {aspectModelLoading: 'Loading', generalWaitMessage: 'Wait'},
          } as any,
          translateService: {translate: vi.fn(() => '')} as any,
        }),
        MockProvider(TauriSignalsService, {call: vi.fn()}),
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
        {provide: RdfNodePort, useValue: {updateQuads: vi.fn()}},
        MockProvider(TabStateService, {
          onModelLoaded: vi.fn(),
          isActiveTabCleanEmpty: vi.fn(() => true),
        }),
        MockProvider(ModelOpenerService, {
          promptForUpload: vi.fn(() => of(true)),
        }),
      ],
    });

    service = TestBed.inject(FileHandlingService);
    modelApiService = TestBed.inject(ModelApiPort);
    modelLoaderService = TestBed.inject(ModelLoaderService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
    loadingScreenService = TestBed.inject(LoadingScreenService);
    notificationsService = TestBed.inject(NotificationsService);
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

  it('loadNamespaceFile should handle error with detailed backend message', () => {
    const errorResponse = {
      error: {
        error: {
          message: 'Aspect Model not found for URN...',
        },
      },
    };
    vi.spyOn(modelApiService, 'fetchAspectMetaModel').mockReturnValue(throwError(() => errorResponse));

    service.loadNamespaceFile('com.example:1.0.0:test.ttl', 'urn:samm:com.example:1.0.0#Aspect');

    expect(notificationsService.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Aspect Model not found for URN...',
      }),
    );
  });

  it('copyToClipboardSync should use ipcRenderer when available', () => {
    service.copyToClipboardSync('test text');
    expect(copyToClipboardMock).toHaveBeenCalledWith('test text');
  });

  describe('saveAspectModelToWorkspace', () => {
    let confirmDialogService: ConfirmDialogService;
    let modelSaverService: ModelSaverService;
    let savingTracker: ModelSavingTrackerService;
    let handleRdfModel: ReturnType<typeof vi.spyOn>;
    let migrateAffectedModels: ReturnType<typeof vi.spyOn>;
    const savedModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    function mockState(isNamespaceChanged: boolean): void {
      vi.spyOn(service as any, 'getModelLoaderState').mockReturnValue(
        of({
          originalModelName: 'org.old:1.0.0:Model.ttl',
          newModelName: 'org.new:1.0.0:Model.ttl',
          oldFileName: 'Model.ttl',
          newFileName: 'Model.ttl',
          loadedFromWorkspace: true,
          isNameChanged: false,
          isNamespaceChanged,
        }),
      );
    }

    function save(): Promise<unknown> {
      return new Promise((resolve, reject) => service.saveAspectModelToWorkspace().subscribe({next: resolve, error: reject}));
    }

    beforeEach(() => {
      const translation = TestBed.inject(LanguageTranslationService);
      Object.assign(translation.language as any, {
        confirmDialog: {
          namespaceChange: {
            phrase4: '',
            phrase7: '',
            title: 'Namespace changed',
            okButton: 'Ok',
            actionButton: 'Keep',
            cancelButton: 'Cancel',
          },
        },
        loadingScreenDialog: {
          ...(translation.language as any).loadingScreenDialog,
          savingToWorkspaceTitle: 'Saving',
          savingToWorkspaceContent: 'Wait',
        },
      });

      confirmDialogService = TestBed.inject(ConfirmDialogService);
      confirmDialogService.open = vi.fn() as any;
      modelSaverService = TestBed.inject(ModelSaverService);
      savingTracker = TestBed.inject(ModelSavingTrackerService);
      modelSaverService.saveModel = vi.fn(() => of(savedModel)) as any;
      handleRdfModel = vi.spyOn(service as any, 'handleRdfModel').mockImplementation(() => undefined);
      migrateAffectedModels = vi.spyOn(service as any, 'migrateAffectedModels').mockReturnValue(of(null));
    });

    it('should save directly without a namespace change', async () => {
      mockState(false);

      await save();

      expect(confirmDialogService.open).not.toHaveBeenCalled();
      expect(modelSaverService.saveModel).toHaveBeenCalledTimes(1);
      expect(savingTracker.updateSavedModel).toHaveBeenCalledTimes(1);
      expect(handleRdfModel).toHaveBeenCalledWith(savedModel, expect.anything());
      expect(loadingScreenService.close).toHaveBeenCalled();
    });

    it('should migrate and save when the namespace change is confirmed with OK', async () => {
      mockState(true);
      confirmDialogService.open = vi.fn(() => of(ConfirmDialogEnum.ok)) as any;

      await save();

      expect(loadingScreenService.open).toHaveBeenCalledTimes(1);
      expect(migrateAffectedModels).toHaveBeenCalledWith('org.old:1.0.0:Model.ttl', 'org.new:1.0.0:Model.ttl');
      expect(modelSaverService.saveModel).toHaveBeenCalledTimes(1);
      expect(savingTracker.updateSavedModel).toHaveBeenCalledTimes(1);
    });

    it('should save without migration on the "keep" action', async () => {
      mockState(true);
      confirmDialogService.open = vi.fn(() => of(ConfirmDialogEnum.action)) as any;

      await save();

      expect(loadingScreenService.open).toHaveBeenCalledTimes(1);
      expect(migrateAffectedModels).not.toHaveBeenCalled();
      expect(modelSaverService.saveModel).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['Cancel', ConfirmDialogEnum.cancel],
      ['(x) / Escape', undefined],
      ['an unknown result', 'something-else'],
    ])('should neither save nor mark the model as saved on %s', async (_label, result) => {
      mockState(true);
      confirmDialogService.open = vi.fn(() => of(result)) as any;

      await save();

      expect(loadingScreenService.open).not.toHaveBeenCalled();
      expect(migrateAffectedModels).not.toHaveBeenCalled();
      expect(modelSaverService.saveModel).not.toHaveBeenCalled();
      expect(savingTracker.updateSavedModel).not.toHaveBeenCalled();
      expect(handleRdfModel).toHaveBeenCalledWith(null, expect.anything());
    });

    it('should keep the unsaved state when saving returns no model', async () => {
      mockState(false);
      modelSaverService.saveModel = vi.fn(() => of(null)) as any;

      await save();

      expect(savingTracker.updateSavedModel).not.toHaveBeenCalled();
      expect(loadingScreenService.close).toHaveBeenCalled();
    });

    it('should close the loading screen also when saving fails', async () => {
      mockState(true);
      confirmDialogService.open = vi.fn(() => of(ConfirmDialogEnum.action)) as any;
      modelSaverService.saveModel = vi.fn(() => throwError(() => new Error('disk full'))) as any;

      await expect(save()).rejects.toThrow('disk full');

      expect(savingTracker.updateSavedModel).not.toHaveBeenCalled();
      expect(loadingScreenService.close).toHaveBeenCalled();
    });
  });
});
