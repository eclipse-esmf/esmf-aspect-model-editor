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
import {afterEach, describe, expect, it} from 'vitest';
import {IPC_RENDERER} from './tauri-ipc.provider';

describe('IPC_RENDERER Provider', () => {
  const originalTauriApi = (window as any).tauriAPI || (window as any).tauriApi;

  afterEach(() => {
    (window as any).tauriAPI = originalTauriApi;
    (window as any).tauriApi = originalTauriApi;
  });

  it('should return window.tauriApi when available', () => {
    const mockApi = {
      send: () => {},
      on: () => {},
      removeListener: () => {},
    };
    (window as any).tauriAPI = mockApi;
    (window as any).tauriApi = mockApi;

    TestBed.resetTestingModule();
    const renderer = TestBed.inject(IPC_RENDERER);
    expect(renderer).toBe(mockApi);
  });

  it('should return undefined when window.tauriApi is undefined', () => {
    delete (window as any).tauriAPI;
    delete (window as any).tauriApi;

    // Create a new TestBed to avoid cached factory output
    TestBed.resetTestingModule();
    const renderer = TestBed.inject(IPC_RENDERER);
    expect(renderer).toBeUndefined();
  });

  it('should create Tauri bridge when Tauri internals are detected', async () => {
    delete (window as any).tauriAPI;
    delete (window as any).tauriApi;
    (window as any).__TAURI_INTERNALS__ = {};

    TestBed.resetTestingModule();
    const renderer = TestBed.inject(IPC_RENDERER);
    expect(renderer).toBeDefined();
    expect(typeof renderer?.openInVsCodeOrDefault).toBe('function');
    expect(typeof renderer?.showContextMenu).toBe('function');
    expect(typeof renderer?.copyToClipboard).toBe('function');

    delete (window as any).__TAURI_INTERNALS__;
  });
});
