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

import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {APP_CONFIG, config} from '../config';
import {TAURI_EVENTS} from '../enums';
import {BackendStatus} from '../model/tauri-api.model';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {BackendStatusService} from './backend-status.service';
import {BrowserService} from './browser.service';

const status = (state: BackendStatus['state'], revision: number, port = '30001', message: string | null = null): BackendStatus => ({
  state,
  port,
  message,
  revision,
});

const flush = () => new Promise(resolve => setTimeout(resolve));

describe('BackendStatusService', () => {
  let listeners: Map<string, (payload: any) => void>;
  let ipcRenderer: any;
  let isTauri: boolean;

  const create = () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: APP_CONFIG, useValue: config},
        {provide: BrowserService, useValue: {isStartedAsTauriApp: () => isTauri}},
        {provide: IPC_RENDERER, useValue: ipcRenderer},
      ],
    });
    return TestBed.inject(BackendStatusService);
  };

  beforeEach(() => {
    isTauri = true;
    listeners = new Map();
    ipcRenderer = {
      on: vi.fn((channel: string, cb: (payload: any) => void) => listeners.set(channel, cb)),
      getBackendPort: vi.fn(() => Promise.resolve('30001')),
      getBackendStatus: vi.fn(() => Promise.resolve(status('starting', 1))),
      retryBackendStart: vi.fn(() => Promise.resolve(status('starting', 5, '30002'))),
      quitApp: vi.fn(() => Promise.resolve()),
    };
  });

  it('is ready immediately when running in the browser', () => {
    isTauri = false;
    const service = create();

    expect(service.isReady()).toBe(true);
    expect(service.hasBeenReady()).toBe(true);
    expect(service.serviceUrl()).toBe(config.serviceUrl);
    expect(ipcRenderer.getBackendStatus).not.toHaveBeenCalled();
  });

  it('starts blocked and becomes ready through the status event', async () => {
    const service = create();
    expect(service.isReady()).toBe(false);

    await flush();
    expect(service.status().state).toBe('starting');
    expect(listeners.has(TAURI_EVENTS.RESPONSE.BACKEND_STATUS)).toBe(true);

    listeners.get(TAURI_EVENTS.RESPONSE.BACKEND_STATUS)(status('ready', 2));

    expect(service.isReady()).toBe(true);
    expect(service.hasBeenReady()).toBe(true);
    expect(service.serviceUrl()).toBe('http://localhost:30001');
  });

  it('ignores out-of-order updates', async () => {
    ipcRenderer.getBackendStatus = vi.fn(() => Promise.resolve(status('starting', 1)));
    const service = create();
    listeners.get(TAURI_EVENTS.RESPONSE.BACKEND_STATUS)(status('ready', 2));

    await flush();

    expect(service.status().state).toBe('ready');
    expect(service.status().revision).toBe(2);
  });

  it('keeps the editor mounted after a crash that follows a successful start', async () => {
    const service = create();
    await flush();
    const emit = listeners.get(TAURI_EVENTS.RESPONSE.BACKEND_STATUS);

    emit(status('ready', 2));
    emit(status('failed', 3, '30001', 'crashed'));

    expect(service.isReady()).toBe(false);
    expect(service.hasBeenReady()).toBe(true);
    expect(service.status().message).toBe('crashed');
  });

  it('retries only when failed and switches to the new port', async () => {
    const service = create();
    await flush();

    service.retry();
    expect(ipcRenderer.retryBackendStart).not.toHaveBeenCalled();

    listeners.get(TAURI_EVENTS.RESPONSE.BACKEND_STATUS)(status('failed', 3, '30001', 'timeout'));
    service.retry();
    service.retry();
    expect(service.retrying()).toBe(true);
    expect(ipcRenderer.retryBackendStart).toHaveBeenCalledTimes(1);

    await flush();
    expect(service.retrying()).toBe(false);
    expect(service.status().state).toBe('starting');

    listeners.get(TAURI_EVENTS.RESPONSE.BACKEND_STATUS)(status('ready', 6, '30002'));
    expect(service.serviceUrl()).toBe('http://localhost:30002');
  });

  it('reports a failure when the status cannot be queried', async () => {
    ipcRenderer.getBackendStatus = vi.fn(() => Promise.reject(new Error('ipc broken')));
    const service = create();

    await flush();

    expect(service.status().state).toBe('failed');
    expect(service.status().message).toBe('ipc broken');
  });

  it('falls back to the port when the shell does not report a status', async () => {
    delete ipcRenderer.getBackendStatus;
    const service = create();

    await flush();

    expect(service.isReady()).toBe(true);
    expect(service.serviceUrl()).toBe('http://localhost:30001');
  });

  it('quits the application through the shell', () => {
    const service = create();
    service.quit();
    expect(ipcRenderer.quitApp).toHaveBeenCalled();
  });
});
