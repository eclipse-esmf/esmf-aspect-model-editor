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
import {ShapeConnectorService} from '@ame/connection';
import {EditorService, FileHandlingService, GenerateHandlingService, SaveModelDialogService, ShapeSettingsService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {MaxGraphService} from '@ame/max-graph';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {ConfigurationService} from '@ame/settings-dialog';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {SearchesStateService} from '@ame/utils';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {IPC_RENDERER} from '../electron-ipc.provider';
import {ELECTRON_EVENTS} from '../enums';
import {ElectronSignalsService} from './electron-signals.service';
import {ElectronTunnelService} from './electron-tunnel.service';
import {ModelSavingTrackerService} from './model-saving-tracker.service';
import {NotificationsService} from './notifications.service';

describe('ElectronTunnelService', () => {
  let service: ElectronTunnelService;
  let ipcRendererMock: any;
  let electronSignalsMock: any;
  let notificationsServiceMock: any;
  let shapeSettingsServiceMock: any;
  let translateMock: any;

  beforeEach(() => {
    ipcRendererMock = {
      send: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    };

    electronSignalsMock = {
      addListener: vi.fn(),
      call: vi.fn(),
    };

    notificationsServiceMock = {
      error: vi.fn(),
      info: vi.fn(),
    };

    shapeSettingsServiceMock = {
      selectedCells$: new BehaviorSubject([]),
      hasCellsSubject$: new BehaviorSubject(false),
      editModel: vi.fn(),
    };

    translateMock = {
      getTranslation: vi.fn(() => of({HELLO: 'Hello'})),
      translateService: {
        getActiveLang: vi.fn(() => 'en'),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        ElectronTunnelService,
        {provide: IPC_RENDERER, useValue: ipcRendererMock},
        {provide: ElectronSignalsService, useValue: electronSignalsMock},
        {provide: NotificationsService, useValue: notificationsServiceMock},
        {provide: ShapeSettingsService, useValue: shapeSettingsServiceMock},
        {provide: LanguageTranslationService, useValue: translateMock},
        {provide: LoadedFilesService, useValue: {currentLoadedFile: {cachedFile: {get: vi.fn()}}}},
        {provide: ModelSavingTrackerService, useValue: {isSaved$: of(true)}},
        {provide: SaveModelDialogService, useValue: {openDialog: vi.fn(() => of(true))}},
        {provide: MaxGraphService, useValue: {navigateToCellByUrn: vi.fn()}},
        {provide: NamespacesManagerService, useValue: {onImportNamespaces: vi.fn(), onExportNamespaces: vi.fn()}},
        {provide: SidebarStateService, useValue: {workspace: {refresh: vi.fn()}}},
        {
          provide: FileHandlingService,
          useValue: {
            loadEmptyModel: vi.fn(() => of(true)),
            onLoadModel: vi.fn(),
            onAddFileToNamespace: vi.fn(),
            onCopyToClipboard: vi.fn(),
            onSaveAspectModelToWorkspace: vi.fn(),
            onExportAsAspectModelFile: vi.fn(),
            onValidateFile: vi.fn(),
          },
        },
        {
          provide: GenerateHandlingService,
          useValue: {
            onGenerateDocumentation: vi.fn(),
            onGenerateOpenApiSpec: vi.fn(),
            onGenerateAsyncApiSpec: vi.fn(),
            onGenerateAASXFile: vi.fn(),
            onGenerateJsonSample: vi.fn(),
            onGenerateJsonSchema: vi.fn(),
          },
        },
        {provide: ConfigurationService, useValue: {toggleToolbar: vi.fn(), toggleEditorMap: vi.fn()}},
        {
          provide: EditorService,
          useValue: {
            zoomIn: vi.fn(),
            zoomOut: vi.fn(),
            fit: vi.fn(),
            actualSize: vi.fn(),
            deleteSelectedElements: vi.fn(),
            toggleExpand: vi.fn(),
            formatModel: vi.fn(),
          },
        },
        {provide: FiltersService, useValue: {renderByFilter: vi.fn()}},
        {provide: ShapeConnectorService, useValue: {connectSelectedElements: vi.fn()}},
        {provide: MatDialog, useValue: {open: vi.fn()}},
        {provide: SearchesStateService, useValue: {elementsSearch: {open: vi.fn()}, filesSearch: {open: vi.fn()}}},
      ],
    });

    service = TestBed.inject(ElectronTunnelService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('sendTranslationsToElectron should send translation signal to IPC', () => {
    service.sendTranslationsToElectron('en');

    expect(translateMock.getTranslation).toHaveBeenCalledWith('en');
    expect(ipcRendererMock.send).toHaveBeenCalledWith(ELECTRON_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS, {
      id: 'TRANSLATE_MENU_ITEMS',
      payload: {translation: {HELLO: 'Hello'}, customMenuItem: undefined},
    });
  });

  it('subscribeMessages should register listeners and send WINDOW_FOCUS', () => {
    service.subscribeMessages();

    expect(ipcRendererMock.send).toHaveBeenCalledWith(ELECTRON_EVENTS.SIGNAL.WINDOW_FOCUS);
    expect(electronSignalsMock.addListener).toHaveBeenCalledWith('updateWindowInfo', expect.any(Function));
    expect(electronSignalsMock.addListener).toHaveBeenCalledWith('openWindow', expect.any(Function));
    expect(electronSignalsMock.addListener).toHaveBeenCalledWith('isFirstWindow', expect.any(Function));
    expect(ipcRendererMock.on).toHaveBeenCalledWith(ELECTRON_EVENTS.RESPONSE.BACKEND_STARTUP_ERROR, expect.any(Function));
  });

  it('should handle isFirstWindow via IPC', () => {
    let responseHandler: (res: boolean) => void = () => {};
    ipcRendererMock.on.mockImplementation((event: string, handler: (res: boolean) => void) => {
      if (event === ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW) {
        responseHandler = handler;
      }
    });

    let isFirst: boolean | undefined;
    (service as any).isFirstWindow().subscribe((val: boolean) => {
      isFirst = val;
    });

    expect(ipcRendererMock.send).toHaveBeenCalledWith(ELECTRON_EVENTS.REQUEST.IS_FIRST_WINDOW);
    responseHandler(true);

    expect(isFirst).toBe(true);
    expect(ipcRendererMock.removeListener).toHaveBeenCalledWith(ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW, responseHandler);
  });

  it('should handle requestWindowData via IPC', () => {
    let dataHandler: (data: any) => void = () => {};
    ipcRendererMock.on.mockImplementation((event: string, handler: (data: any) => void) => {
      if (event === ELECTRON_EVENTS.RESPONSE.WINDOW_DATA) {
        dataHandler = handler;
      }
    });

    let receivedData: any;
    (service as any).requestWindowData().subscribe((data: any) => {
      receivedData = data;
    });

    expect(ipcRendererMock.send).toHaveBeenCalledWith(ELECTRON_EVENTS.REQUEST.WINDOW_DATA);
    dataHandler({id: 'win-1', options: {namespace: 'org.example'}});

    expect(receivedData).toEqual({id: 'win-1', options: {namespace: 'org.example'}});
  });
});
