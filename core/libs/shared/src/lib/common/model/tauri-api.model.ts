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

export interface TauriContextMenuPayload {
  href: string | null;
}

export type BackendPhase = 'starting' | 'ready' | 'failed';

export interface BackendStatus {
  state: BackendPhase;
  port: string;
  message: string | null;
  /** Increases with every change; used to drop out-of-order updates. */
  revision: number;
}

export interface TauriApi {
  send(channel: string, ...args: unknown[]): void;
  on(channel: string, cb: (...args: any[]) => void): void;
  removeListener(listener: string, cb: (...args: any[]) => void): void;
  getBackendPort(): Promise<string>;
  getBackendStatus(): Promise<BackendStatus>;
  retryBackendStart(): Promise<BackendStatus>;
  quitApp(): Promise<void>;
  openPrintWindow(filePath: string): Promise<unknown>;
  writePrintFile(content: string): Promise<string>;
  openExternalLink(link: string): Promise<void> | boolean;
  showContextMenu(payload: TauriContextMenuPayload): void;
  openInVsCodeOrDefault(vscodeUrl: string, filePath: string): Promise<void>;
  copyToClipboard(text: string): void;
}
