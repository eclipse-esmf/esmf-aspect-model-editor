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

import {InjectionToken} from '@angular/core';
import {ElectronApi} from './model/electron-api.model';

declare global {
  interface Window {
    electronAPI?: ElectronApi;
  }
}

export const IPC_RENDERER = new InjectionToken<ElectronApi | undefined>('ElectronIpcRenderer', {
  providedIn: 'root',
  factory: () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return window.electronAPI;
    }
    return undefined;
  },
});
