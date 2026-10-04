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

import {ConfigurationService} from '@ame/domain';
import {IPC_RENDERER, TAURI_EVENTS} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {describe, expect, it, vi} from 'vitest';
import {SettingDialogComponent} from './components/settings-dialog/setting-dialog.component';
import {SettingsDialogService, SettingsTauriBridge} from './provide-settings';

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
        {provide: SettingsDialogService, useValue: {open: vi.fn()}},
      ],
    });

    TestBed.inject(SettingsTauriBridge).register();
    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR)!();
    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP)!();

    expect(configurationService.toggleToolbar).toHaveBeenCalled();
    expect(configurationService.toggleEditorMap).toHaveBeenCalled();
  });
});

describe('SettingsTauriBridge - open settings', () => {
  it('opens the settings dialog when the menu item / shortcut (Cmd/Ctrl+,) is triggered', () => {
    const ipcMock = createIpcMock();
    const settingsDialog = {open: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        {provide: IPC_RENDERER, useValue: ipcMock},
        {provide: ConfigurationService, useValue: {toggleToolbar: vi.fn(), toggleEditorMap: vi.fn()}},
        {provide: SettingsDialogService, useValue: settingsDialog},
      ],
    });

    TestBed.inject(SettingsTauriBridge).register();
    expect(ipcMock.on).toHaveBeenCalledWith(TAURI_EVENTS.SIGNAL.OPEN_SETTINGS, expect.any(Function));
    ipcMock.handlers.get(TAURI_EVENTS.SIGNAL.OPEN_SETTINGS)!();

    expect(settingsDialog.open).toHaveBeenCalledTimes(1);
  });
});

describe('SettingsDialogService', () => {
  it('opens the settings dialog', () => {
    const matDialog = {open: vi.fn()};
    TestBed.configureTestingModule({providers: [{provide: MatDialog, useValue: matDialog}]});

    TestBed.inject(SettingsDialogService).open();

    expect(matDialog.open).toHaveBeenCalledWith(SettingDialogComponent, {
      panelClass: 'settings-dialog-container',
      width: '60%',
      minWidth: 'min(720px, 95vw)',
      autoFocus: false,
    });
  });

  it('does not open a second settings dialog while one is already open', () => {
    const openDialog = {componentInstance: Object.create(SettingDialogComponent.prototype)};
    const matDialog = {open: vi.fn(), openDialogs: [openDialog]};
    TestBed.configureTestingModule({providers: [{provide: MatDialog, useValue: matDialog}]});

    TestBed.inject(SettingsDialogService).open();

    expect(matDialog.open).not.toHaveBeenCalled();
  });

  it('opens the settings dialog while another dialog is open', () => {
    const matDialog = {open: vi.fn(), openDialogs: [{componentInstance: {}}]};
    TestBed.configureTestingModule({providers: [{provide: MatDialog, useValue: matDialog}]});

    TestBed.inject(SettingsDialogService).open();

    expect(matDialog.open).toHaveBeenCalledTimes(1);
  });
});
