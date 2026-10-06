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

import {SearchStore} from '@ame/domain';
import {IPC_RENDERER, TAURI_EVENTS} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi} from 'vitest';
import {SearchTauriBridge} from './provide-search';

function createIpcMock() {
  const handlers = new Map<string, (...args: any[]) => void>();
  return {
    handlers,
    send: vi.fn(),
    on: vi.fn((event: string, handler: (...args: any[]) => void) => handlers.set(event, handler)),
  };
}

describe('SearchTauriBridge', () => {
  it('opens element and file search via SearchStore', () => {
    const ipcMock = createIpcMock();
    TestBed.configureTestingModule({providers: [{provide: IPC_RENDERER, useValue: ipcMock}]});
    const store = TestBed.inject(SearchStore);

    TestBed.inject(SearchTauriBridge).register();

    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.SEARCH_ELEMENTS)!();
    expect(store.elementsSearchOpened()).toBe(true);
    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.SEARCH_FILES)!();
    expect(store.filesSearchOpened()).toBe(true);
  });
});
