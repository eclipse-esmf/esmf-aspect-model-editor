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

export class TauriHelper {
  constructor(public page: Page) {}

  /**
   * Injects the Tauri mock API bridge into the page before navigation.
   */
  async initTauriMock(): Promise<void> {
    await this.page.addInitScript(() => {
      const listeners = new Map<string, Set<Function>>();
      const sentEvents: Array<{channel: string; args: any[]}> = [];

      (window as any).__tauriMock = {
        listeners,
        sentEvents,
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
        async openPrintWindow(filePath: string) {
          return {};
        },
        async writePrintFile(content: string) {
          return 'saved';
        },
        async openExternalLink(link: string) {},
        async openInVsCodeOrDefault(vscodeUrl: string, fallbackUrl: string) {},
        showContextMenu(payload: any) {},
        copyToClipboard(text: string) {},
      };
    });
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
   * Clears the recorded sent events history.
   */
  async clearSentEvents(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__tauriMock?.clearSentEvents();
    });
  }
}
