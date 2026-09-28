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

import {IPC_RENDERER, TAURI_EVENTS} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi} from 'vitest';
import {SettingsTauriBridge} from './provide-settings';
import {ConfigurationService} from './services/configuration.service';

function createIpcMock() {
  const handlers = new Map<string, (...args: any[]) => void>();
  return {
    handlers,
    send: vi.fn(),
    on: vi.fn((event: string, handler: (...args: any[]) => void) => handlers.set(event, handler)),
  };
}

describe('SettingsTauriBridge', () => {
  it('toggles toolbar and minimap', () => {
    const ipcMock = createIpcMock();
    const configurationService = {toggleToolbar: vi.fn(), toggleEditorMap: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        {provide: IPC_RENDERER, useValue: ipcMock},
        {provide: ConfigurationService, useValue: configurationService},
      ],
    });

    TestBed.inject(SettingsTauriBridge).register();
    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR)!();
    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP)!();

    expect(configurationService.toggleToolbar).toHaveBeenCalled();
    expect(configurationService.toggleEditorMap).toHaveBeenCalled();
  });
});
