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
import {describe, expect, it, vi} from 'vitest';
import {TAURI_EVENTS} from '../enums';
import {OpenModelsSnapshot, OpenWindowModels} from '../model/startup-options';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {BrowserService} from './browser.service';
import {OtherWindowsModelsService} from './other-windows-models.service';

const model = (namespace: string, file: string) => ({namespace, file, aspectModelUrn: `urn:samm:${namespace}#${file.replace('.ttl', '')}`});

const SNAPSHOT: OpenModelsSnapshot = {
  windowLabel: 'main',
  windows: [
    {label: 'main', models: [model('org.own:1.0.0', 'Own.ttl')]},
    {label: 'win-1', models: [model('org.a:1.0.0', 'A1.ttl'), model('org.b:1.0.0', 'B1.ttl')]},
  ],
};

function setUp(options: {isTauri?: boolean; snapshot?: Promise<OpenModelsSnapshot>; withoutGetOpenModels?: boolean} = {}) {
  const listeners = new Map<string, (payload: unknown) => void>();
  const ipcRenderer = {
    on: vi.fn((channel: string, cb: (payload: unknown) => void) => listeners.set(channel, cb)),
    getOpenModels: options.withoutGetOpenModels ? undefined : vi.fn(() => options.snapshot ?? Promise.resolve(SNAPSHOT)),
  };

  TestBed.configureTestingModule({
    providers: [
      {provide: BrowserService, useValue: {isStartedAsTauriApp: () => options.isTauri ?? true}},
      {provide: IPC_RENDERER, useValue: ipcRenderer},
    ],
  });

  const service = TestBed.inject(OtherWindowsModelsService);
  const emit = (windows: OpenWindowModels[]) => listeners.get(TAURI_EVENTS.RESPONSE.OPEN_MODELS)?.(windows);
  return {service, ipcRenderer, emit};
}

const flush = () => new Promise(resolve => setTimeout(resolve));

describe('OtherWindowsModelsService', () => {
  it('knows the models of the other windows but not the own ones', async () => {
    const {service} = setUp();
    await flush();

    expect(service.models().map(m => m.file)).toEqual(['A1.ttl', 'B1.ttl']);
    expect(service.isFileOpen('org.a:1.0.0', 'A1.ttl')).toBe(true);
    expect(service.isFileOpen('org.a:1.0.0', 'A2.ttl')).toBe(false);
    expect(service.isFileOpen('org.own:1.0.0', 'Own.ttl')).toBe(false);
    expect(service.isNamespaceOpen('org.b:1.0.0')).toBe(true);
    expect(service.isNamespaceOpen('org.a:2.0.0')).toBe(false);
    expect(service.hasOpenModels()).toBe(true);
  });

  it('follows the updates pushed by the desktop shell', async () => {
    const {service, emit} = setUp();
    await flush();

    emit([{label: 'main', models: []}]);
    expect(service.hasOpenModels()).toBe(false);

    emit([{label: 'win-2', models: [model('org.c:1.0.0', 'C.ttl')]}]);
    expect(service.isFileOpen('org.c:1.0.0', 'C.ttl')).toBe(true);
  });

  it('counts nothing until the own window is known', async () => {
    let resolve: (snapshot: OpenModelsSnapshot) => void = () => undefined;
    const {service, emit} = setUp({snapshot: new Promise(r => (resolve = r))});

    emit(SNAPSHOT.windows);
    expect(service.hasOpenModels()).toBe(false);

    resolve(SNAPSHOT);
    await flush();
    expect(service.isFileOpen('org.a:1.0.0', 'A1.ttl')).toBe(true);
  });

  it('keeps a pushed update which is newer than the answer', async () => {
    let resolve: (snapshot: OpenModelsSnapshot) => void = () => undefined;
    const {service, emit} = setUp({snapshot: new Promise(r => (resolve = r))});

    emit([{label: 'win-9', models: [model('org.new:1.0.0', 'New.ttl')]}]);
    resolve(SNAPSHOT);
    await flush();

    expect(service.models().map(m => m.file)).toEqual(['New.ttl']);
  });

  it('does nothing in the browser', async () => {
    const {service, ipcRenderer} = setUp({isTauri: false});
    await flush();

    expect(ipcRenderer.getOpenModels).not.toHaveBeenCalled();
    expect(service.hasOpenModels()).toBe(false);
  });

  it('does nothing with an older desktop shell', async () => {
    const {service, ipcRenderer} = setUp({withoutGetOpenModels: true});
    await flush();

    expect(ipcRenderer.on).not.toHaveBeenCalled();
    expect(service.hasOpenModels()).toBe(false);
  });
});
