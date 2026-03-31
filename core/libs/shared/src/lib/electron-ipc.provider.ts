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

declare global {
  interface Window {
    electronAPI?: {
      send?: void;
      on?: void;
      removeListener?: void;
      getBackendPort?: Promise<number>;
      openPrintWindow?: Promise<any>;
      writePrintFile?: Promise<any>;
      openExternalLink?: Promise<void> | boolean;
      showContextMenu?: void;
    };
  }
}

export const IPC_RENDERER = new InjectionToken<any>('ElectronIpcRenderer', {
  providedIn: 'root',
  factory: () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return window.electronAPI;
    }
    return undefined;
  },
});
