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

import {contextBridge, ipcRenderer, shell} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, args: unknown): void => ipcRenderer.send(channel, args),
  on: (channel: string, cb: (...args: unknown[]) => void) => ipcRenderer.on(channel, (_e, ...args) => cb(...args)),
  removeListener: (listener: string, cb: (value: unknown) => void) => ipcRenderer.removeListener(listener, cb),
  getBackendPort: async (): Promise<string> => await ipcRenderer.invoke('get-backend-port'),
  openPrintWindow: async (filePath: string) => await ipcRenderer.invoke('OPEN_PRINT_WINDOW', filePath),
  writePrintFile: (content: string) => ipcRenderer.invoke('WRITE_PRINT_FILE', content),
  openExternalLink: (link: string) => shell.openExternal(link),
  showContextMenu: (payload: {href: string | null}) => ipcRenderer.send('SHOW_CONTEXT_MENU', payload),
});
