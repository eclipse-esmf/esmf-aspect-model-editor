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
  CONFIGURATION_SERVICE,
  IPC_RENDERER,
  ITauriIpcBridge,
  SAMM_LANGUAGE_SETTINGS_SERVICE,
  SETTINGS_DIALOG_COMPONENT,
  TAURI_EVENTS,
  TAURI_IPC_BRIDGES,
} from '@ame/shared';
import {EnvironmentProviders, Injectable, inject, makeEnvironmentProviders} from '@angular/core';
import {SettingDialogComponent} from './components/settings-dialog/setting-dialog.component';
import {ConfigurationService} from './services/configuration.service';
import {SammLanguageSettingsService} from './services/samm-language-settings.service';

/** Handles settings related Tauri menu events (toolbar/minimap visibility). */
@Injectable({providedIn: 'root'})
export class SettingsTauriBridge implements ITauriIpcBridge {
  private ipcRenderer = inject(IPC_RENDERER);
  private configurationService = inject(ConfigurationService);

  register(): void {
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR, () => this.configurationService.toggleToolbar());
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.SHOW_HIDE_MINIMAP, () => this.configurationService.toggleEditorMap());
  }
}

/** Binds settings implementations to their shared contracts. */
export function provideSettings(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: CONFIGURATION_SERVICE, useExisting: ConfigurationService},
    {provide: SAMM_LANGUAGE_SETTINGS_SERVICE, useExisting: SammLanguageSettingsService},
    {provide: SETTINGS_DIALOG_COMPONENT, useValue: SettingDialogComponent},
    {provide: TAURI_IPC_BRIDGES, useExisting: SettingsTauriBridge, multi: true},
  ]);
}
