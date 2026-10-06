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
import {IPC_RENDERER, ITauriIpcBridge, TAURI_EVENTS, TAURI_IPC_BRIDGES} from '@ame/shared';
import {EnvironmentProviders, Injectable, inject, makeEnvironmentProviders} from '@angular/core';

/** Handles search related Tauri menu events. */
@Injectable({providedIn: 'root'})
export class SearchTauriBridge implements ITauriIpcBridge {
  private ipcRenderer = inject(IPC_RENDERER);
  private searchStore = inject(SearchStore);

  register(): void {
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.SEARCH_ELEMENTS, () => this.searchStore.openElementsSearch());
    this.ipcRenderer?.on(TAURI_EVENTS.SIGNAL.SEARCH_FILES, () => this.searchStore.openFilesSearch());
  }
}

export function provideSearch(): EnvironmentProviders {
  return makeEnvironmentProviders([{provide: TAURI_IPC_BRIDGES, useExisting: SearchTauriBridge, multi: true}]);
}
