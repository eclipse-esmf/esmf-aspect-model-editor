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

import {Page} from '@playwright/test';

export interface TauriSentEvent {
  channel: string;
  args: any[];
}

export interface MockBackendStatus {
  state: 'starting' | 'ready' | 'failed';
  port: string;
  message: string | null;
  revision: number;
}

export interface TauriMockOptions {
  /** Initial backend status reported by the mocked shell. Defaults to ready. */
  backendStatus?: MockBackendStatus;
}

export class TauriHelper {
  constructor(public page: Page) {}

  /**
   * Injects the Tauri mock API bridge into the page before navigation.
   */
  async initTauriMock(options: TauriMockOptions = {}): Promise<void> {
    const backendStatus: MockBackendStatus = options.backendStatus ?? {state: 'ready', port: '9090', message: null, revision: 0};

    await this.page.addInitScript(initialBackendStatus => {
      const listeners = new Map<string, Set<Function>>();
      const sentEvents: Array<{channel: string; args: any[]}> = [];

      (window as any).__tauriMock = {
        listeners,
        sentEvents,
        activeContextHref: null,
        backendStatus: initialBackendStatus,
        trigger(channel: string, payload?: any) {
          const cbs = listeners.get(channel);
          if (cbs) {
            cbs.forEach(cb => {
              try {
                cb(payload);
              } catch (e) {
                console.error(`Error in mock Tauri listener for ${channel}:`, e);
              }
            });
          }
        },
        getSentEvents(channel?: string) {
          return channel ? sentEvents.filter(e => e.channel === channel) : [...sentEvents];
        },
        clearSentEvents() {
          sentEvents.length = 0;
        },
        triggerContextMenuAction(action: 'ctx_open' | 'ctx_copy') {
          const href = (window as any).__tauriMock.activeContextHref;
          if (!href) return;
          if (action === 'ctx_open') {
            sentEvents.push({channel: 'openExternalLink', args: [href]});
          } else if (action === 'ctx_copy') {
            sentEvents.push({channel: 'copyToClipboard', args: [href]});
          }
        },
      };

      (window as any).tauriAPI = {
        send(channel: string, ...args: any[]) {
          sentEvents.push({channel, args});
        },
        on(channel: string, cb: Function) {
          let set = listeners.get(channel);
          if (!set) {
            set = new Set();
            listeners.set(channel, set);
          }
          set.add(cb);
        },
        removeListener(channel: string, cb: Function) {
          listeners.get(channel)?.delete(cb);
        },
        async getBackendPort() {
          return '8080';
        },
        async getBackendStatus() {
          return (window as any).__tauriMock.backendStatus;
        },
        async retryBackendStart() {
          const mock = (window as any).__tauriMock;
          sentEvents.push({channel: 'retryBackendStart', args: []});
          mock.backendStatus = {...mock.backendStatus, state: 'starting', message: null, revision: mock.backendStatus.revision + 1};
          return mock.backendStatus;
        },
        async quitApp() {
          sentEvents.push({channel: 'quitApp', args: []});
        },
        async openPrintWindow(filePath: string) {
          return {};
        },
        async writePrintFile(content: string) {
          return 'saved';
        },
        async openExternalLink(link: string) {
          sentEvents.push({channel: 'openExternalLink', args: [link]});
        },
        async openInVsCodeOrDefault(vscodeUrl: string, filePath: string) {
          sentEvents.push({channel: 'openInVsCodeOrDefault', args: [vscodeUrl, filePath]});
        },
        showContextMenu(payload: any) {
          (window as any).__tauriMock.activeContextHref = payload?.href || null;
          sentEvents.push({channel: 'showContextMenu', args: [payload]});
        },
        copyToClipboard(text: string) {
          sentEvents.push({channel: 'copyToClipboard', args: [text]});
        },
      };
    }, backendStatus);
  }

  /**
   * Simulates a backend status change pushed by the Tauri shell.
   */
  async emitBackendStatus(status: MockBackendStatus): Promise<void> {
    await this.page.evaluate(next => {
      const mock = (window as any).__tauriMock;
      mock.backendStatus = next;
      mock.trigger('BACKEND_STATUS', next);
    }, status);
  }

  /**
   * Emits a signal/event from Tauri backend into the frontend application.
   */
  async emitSignal(channel: string, payload?: any): Promise<void> {
    await this.page.evaluate(
      ({ch, pl}) => {
        (window as any).__tauriMock?.trigger(ch, pl);
      },
      {ch: channel, pl: payload},
    );
  }

  /**
   * Retrieves events sent from the frontend application to the Tauri backend.
   */
  async getSentEvents(channel?: string): Promise<TauriSentEvent[]> {
    return await this.page.evaluate(ch => {
      return (window as any).__tauriMock?.getSentEvents(ch) || [];
    }, channel);
  }

  /**
   * Triggers a Tauri native context menu action (ctx_open or ctx_copy) for the active context link.
   */
  async triggerContextMenuAction(action: 'ctx_open' | 'ctx_copy'): Promise<void> {
    await this.page.evaluate(act => {
      (window as any).__tauriMock?.triggerContextMenuAction(act);
    }, action);
  }

  /**
   * Clears the recorded sent events history.
   */
  async clearSentEvents(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__tauriMock?.clearSentEvents();
    });
  }
}
