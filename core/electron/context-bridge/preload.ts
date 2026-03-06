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

/**
 * Exposes a set of Electron IPC and shell functions to the renderer process via the `electronAPI` object.
 * Provides methods for sending and receiving IPC messages, interacting with the backend, printing, opening external links, and showing context menus.
 *
 * @namespace electronAPI
 * @property {function(string, unknown): void} send - Sends an IPC message to the main process.
 * @property {function(string, function(...unknown): void): void} on - Registers a listener for IPC messages from the main process.
 * @property {function(string, function(unknown): void): void} removeListener - Removes a specific IPC listener.
 * @property {function(): Promise<string>} getBackendPort - Retrieves the backend port asynchronously.
 * @property {function(string): Promise<unknown>} openPrintWindow - Opens a print window for the specified file path.
 * @property {function(string): Promise<unknown>} writePrintFile - Writes content to a print file.
 * @property {function(string): Promise<void>} openExternalLink - Opens an external link in the default browser.
 * @property {function({href: string|null}): void} showContextMenu - Shows a context menu for the given payload.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Sends an IPC message to the main process.
   *
   * @param {string} channel - The IPC channel name.
   * @param {unknown} args - Arguments to send.
   */
  send: (channel: string, args: unknown): void => ipcRenderer.send(channel, args),

  /**
   * Registers a listener for IPC messages from the main process.
   *
   * @param {string} channel - The IPC channel name.
   * @param {function(...unknown): void} cb - Callback to handle received arguments.
   */
  on: (channel: string, cb: (...args: unknown[]) => void) => ipcRenderer.on(channel, (_e, ...args) => cb(...args)),

  /**
   * Removes a specific IPC listener.
   *
   * @param {string} listener - The IPC channel name.
   * @param {function(unknown): void} cb - The callback to remove.
   */
  removeListener: (listener: string, cb: (value: unknown) => void) => ipcRenderer.removeListener(listener, cb),

  /**
   * Retrieves the backend port asynchronously.
   *
   * @returns {Promise<string>} The backend port.
   */
  getBackendPort: async (): Promise<string> => await ipcRenderer.invoke('get-backend-port'),

  /**
   * Opens a print window for the specified file path.
   *
   * @param {string} filePath - The file path to print.
   * @returns {Promise<unknown>} Result of the print window operation.
   */
  openPrintWindow: async (filePath: string): Promise<unknown> => await ipcRenderer.invoke('OPEN_PRINT_WINDOW', filePath),

  /**
   * Writes content to a print file.
   *
   * @param {string} content - The content to write.
   * @returns {Promise<unknown>} Result of the write operation.
   */
  writePrintFile: (content: string): Promise<unknown> => ipcRenderer.invoke('WRITE_PRINT_FILE', content),

  /**
   * Opens an external link in the default browser.
   *
   * @param {string} link - The URL to open.
   * @returns {Promise<void>} Resolves when the link is opened.
   */
  openExternalLink: (link: string): boolean => shell.openExternal(link),

  /**
   * Shows a context menu for the given payload.
   *
   * @param {{href: string|null}} payload - The payload containing the link.
   */
  showContextMenu: (payload: {href: string | null}) => ipcRenderer.send('SHOW_CONTEXT_MENU', payload),
});
