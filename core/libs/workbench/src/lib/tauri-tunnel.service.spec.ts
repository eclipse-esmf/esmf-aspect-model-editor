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
  IPC_RENDERER,
  LanguageTranslationService,
  NotificationsService,
  TAURI_EVENTS,
  TAURI_IPC_BRIDGES,
  TauriSignalsService,
} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TauriTunnelService} from './tauri-tunnel.service';

describe('TauriTunnelService', () => {
  let service: TauriTunnelService;
  let ipcRendererMock: any;
  let tauriSignalsMock: any;
  let notificationsServiceMock: any;
  let translateMock: any;
  let bridgeMock: {register: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    ipcRendererMock = {send: vi.fn(), on: vi.fn(), removeListener: vi.fn()};
    tauriSignalsMock = {addListener: vi.fn(), call: vi.fn()};
    notificationsServiceMock = {error: vi.fn(), info: vi.fn()};
    translateMock = {
      getTranslation: vi.fn(() => of({HELLO: 'Hello'})),
      translateService: {getActiveLang: vi.fn(() => 'en')},
    };
    bridgeMock = {register: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        TauriTunnelService,
        {provide: IPC_RENDERER, useValue: ipcRendererMock},
        {provide: TauriSignalsService, useValue: tauriSignalsMock},
        {provide: NotificationsService, useValue: notificationsServiceMock},
        {provide: LanguageTranslationService, useValue: translateMock},
        {provide: TAURI_IPC_BRIDGES, useValue: bridgeMock, multi: true},
      ],
    });

    service = TestBed.inject(TauriTunnelService);
  });

  it('subscribeMessages should register all feature bridges', () => {
    service.subscribeMessages();
    expect(bridgeMock.register).toHaveBeenCalledTimes(1);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('sendTranslationsToTauri should send translation signal to IPC', () => {
    service.sendTranslationsToTauri('en');

    expect(translateMock.getTranslation).toHaveBeenCalledWith('en');
    expect(ipcRendererMock.send).toHaveBeenCalledWith(TAURI_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS, {
      id: 'TRANSLATE_MENU_ITEMS',
      payload: {translation: {HELLO: 'Hello'}, customMenuItem: undefined},
    });
  });

  it('subscribeMessages should register listeners and send WINDOW_FOCUS', () => {
    service.subscribeMessages();

    expect(ipcRendererMock.send).toHaveBeenCalledWith(TAURI_EVENTS.SIGNAL.WINDOW_FOCUS);
    expect(tauriSignalsMock.addListener).toHaveBeenCalledWith('updateWindowInfo', expect.any(Function));
    expect(tauriSignalsMock.addListener).toHaveBeenCalledWith('openWindow', expect.any(Function));
    expect(tauriSignalsMock.addListener).toHaveBeenCalledWith('isFirstWindow', expect.any(Function));
    expect(ipcRendererMock.on).toHaveBeenCalledWith(TAURI_EVENTS.RESPONSE.BACKEND_STARTUP_ERROR, expect.any(Function));
  });

  it('should handle isFirstWindow via IPC', () => {
    let responseHandler: (res: boolean) => void = () => {};
    ipcRendererMock.on.mockImplementation((event: string, handler: (res: boolean) => void) => {
      if (event === TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW) {
        responseHandler = handler;
      }
    });

    let isFirst: boolean | undefined;
    (service as any).isFirstWindow().subscribe((val: boolean) => {
      isFirst = val;
    });

    expect(ipcRendererMock.send).toHaveBeenCalledWith(TAURI_EVENTS.REQUEST.IS_FIRST_WINDOW);
    responseHandler(true);

    expect(isFirst).toBe(true);
    expect(ipcRendererMock.removeListener).toHaveBeenCalledWith(TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW, responseHandler);
  });

  it('should handle requestWindowData via IPC', () => {
    let dataHandler: (data: any) => void = () => {};
    ipcRendererMock.on.mockImplementation((event: string, handler: (data: any) => void) => {
      if (event === TAURI_EVENTS.RESPONSE.WINDOW_DATA) {
        dataHandler = handler;
      }
    });

    let receivedData: any;
    (service as any).requestWindowData().subscribe((data: any) => {
      receivedData = data;
    });

    expect(ipcRendererMock.send).toHaveBeenCalledWith(TAURI_EVENTS.REQUEST.WINDOW_DATA);
    dataHandler({id: 'win-1', options: {namespace: 'org.example'}});

    expect(receivedData).toEqual({id: 'win-1', options: {namespace: 'org.example'}});
  });

  it('should forward session updates and the restore setting to the desktop shell', () => {
    const listeners = new Map<string, (payload?: any) => void>();
    tauriSignalsMock.addListener.mockImplementation((name: string, callback: (payload?: any) => void) => listeners.set(name, callback));
    service.subscribeMessages();

    const session = {models: [{namespace: 'ns', file: 'A.ttl', aspectModelUrn: 'urn:samm:ns#A'}], activeIndex: 0};
    listeners.get('updateSession')?.(session);
    listeners.get('setSessionRestoreEnabled')?.(false);

    expect(ipcRendererMock.send).toHaveBeenCalledWith(TAURI_EVENTS.REQUEST.UPDATE_SESSION, session);
    expect(ipcRendererMock.send).toHaveBeenCalledWith(TAURI_EVENTS.REQUEST.SET_SESSION_RESTORE, false);
  });
});
