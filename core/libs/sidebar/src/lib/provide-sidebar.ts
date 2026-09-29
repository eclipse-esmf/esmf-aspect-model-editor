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

import {SidebarStatePort, WorkspaceStore} from '@ame/domain';
import {IPC_RENDERER, ITauriIpcBridge, TAURI_EVENTS, TAURI_IPC_BRIDGES} from '@ame/shared';
import {EnvironmentProviders, Injectable, inject, makeEnvironmentProviders} from '@angular/core';
import {SidebarStateService} from './sidebar-state.service';

/** Handles workspace related Tauri events. */
@Injectable({providedIn: 'root'})
export class SidebarTauriBridge implements ITauriIpcBridge {
  private ipcRenderer = inject(IPC_RENDERER);
  private workspaceStore = inject(WorkspaceStore);

  register(): void {
    this.ipcRenderer?.on(TAURI_EVENTS.REQUEST.REFRESH_WORKSPACE, () => this.workspaceStore.triggerRefresh());
  }
}

export function provideSidebar(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: SidebarStatePort, useExisting: SidebarStateService},
    {provide: TAURI_IPC_BRIDGES, useExisting: SidebarTauriBridge, multi: true},
  ]);
}
