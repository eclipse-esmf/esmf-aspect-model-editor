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

import {ConfigurationService, SettingsDialogPort} from '@ame/domain';
import {IPC_RENDERER, ITauriIpcBridge, TAURI_EVENTS, TAURI_IPC_BRIDGES, viewportSafeWidth} from '@ame/shared';
import {EnvironmentProviders, Injectable, inject, makeEnvironmentProviders} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SettingDialogComponent} from './components/settings-dialog/setting-dialog.component';

/** Handles settings related Tauri menu events (toolbar/minimap visibility, open settings). */
@Injectable({providedIn: 'root'})
export class SettingsTauriBridge implements ITauriIpcBridge {
  private ipcRenderer = inject(IPC_RENDERER);
  private configurationService = inject(ConfigurationService);
  private settingsDialog = inject(SettingsDialogService);

  register(): void {
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR, () => this.configurationService.toggleToolbar());
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP, () => this.configurationService.toggleEditorMap());
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.OPEN_SETTINGS, () => this.settingsDialog.open());
  }
}

/** Opens the settings dialog on behalf of other features. */
@Injectable({providedIn: 'root'})
export class SettingsDialogService implements SettingsDialogPort {
  private matDialog = inject(MatDialog);

  open(): void {
    // Repeated shortcut presses (Cmd/Ctrl+,) must not stack several settings dialogs.
    if (this.matDialog.openDialogs?.some(dialog => dialog.componentInstance instanceof SettingDialogComponent)) {
      return;
    }

    this.matDialog.open(SettingDialogComponent, {
      panelClass: 'settings-dialog-container',
      width: '60%',
      minWidth: viewportSafeWidth(720),
      autoFocus: false,
    });
  }
}

/** Binds settings implementations to their shared contracts. */
export function provideSettings(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: SettingsDialogPort, useExisting: SettingsDialogService},
    {provide: TAURI_IPC_BRIDGES, useExisting: SettingsTauriBridge, multi: true},
  ]);
}
