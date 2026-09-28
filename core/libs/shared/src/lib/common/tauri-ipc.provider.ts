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
import {TAURI_EVENTS} from './enums';
import {TauriApi, TauriContextMenuPayload} from './model/tauri-api.model';

declare global {
  interface Window {
    tauriAPI?: TauriApi;
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  }
}

function createTauriBridge(): TauriApi {
  if (typeof document !== 'undefined') {
    const syncTitle = () => {
      import('@tauri-apps/api/core')
        .then(({invoke}) => {
          invoke('set_window_title', {title: document.title});
        })
        .catch(() => {});
    };
    const titleEl = document.querySelector('title');
    if (titleEl) {
      const observer = new MutationObserver(syncTitle);
      observer.observe(titleEl, {childList: true, characterData: true, subtree: true});
    }
    if (document.title) {
      syncTitle();
    }
  }

  const listenersMap = new Map<string, Map<(...args: any[]) => void, Promise<() => void>>>();
  const internalCallbacks = new Map<string, Set<(...args: any[]) => void>>();

  const triggerInternal = (channel: string, ...args: any[]) => {
    const cbs = internalCallbacks.get(channel);
    if (cbs) {
      cbs.forEach(cb => {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Error in listener for ${channel}:`, e);
        }
      });
    }
  };

  return {
    send(channel: string, ...args: unknown[]): void {
      const payload = args[0];
      import('@tauri-apps/api/core').then(({invoke}) => {
        import('@tauri-apps/api/webviewWindow').then(({getCurrentWebviewWindow}) => {
          const winLabel = getCurrentWebviewWindow().label;
          switch (channel) {
            case TAURI_EVENTS.REQUEST.CREATE_WINDOW:
              invoke('create_window', {options: payload});
              break;
            case TAURI_EVENTS.REQUEST.UPDATE_DATA:
              invoke('update_window_data', {windowLabel: winLabel, options: payload});
              break;
            case TAURI_EVENTS.REQUEST.MAXIMIZE_WINDOW:
              invoke('maximize_window', {windowLabel: winLabel});
              break;
            case TAURI_EVENTS.REQUEST.CLOSE_WINDOW:
              invoke('close_window', {windowLabel: typeof payload === 'string' ? payload : winLabel});
              break;
            case TAURI_EVENTS.SIGNAL.UPDATE_MENU_ITEM:
              if (payload && typeof payload === 'object') {
                invoke('update_menu_item', {
                  ids: (payload as any).ids || [],
                  payload: (payload as any).payload || {},
                });
              }
              break;
            case TAURI_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS:
              if (payload && typeof payload === 'object') {
                invoke('translate_menu_items', {
                  payload: (payload as any).payload || payload,
                });
              }
              break;
            case TAURI_EVENTS.REQUEST.IS_FIRST_WINDOW:
              invoke<boolean>('is_first_window').then(isFirst => {
                triggerInternal(TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW, isFirst);
              });
              break;
            case TAURI_EVENTS.REQUEST.WINDOW_DATA:
              invoke<any>('get_window_data', {windowLabel: winLabel}).then(data => {
                triggerInternal(TAURI_EVENTS.RESPONSE.WINDOW_DATA, data);
              });
              break;
            case TAURI_EVENTS.SIGNAL.WINDOW_FOCUS:
              break;
            case TAURI_EVENTS.SIGNAL.REFRESH_WORKSPACE:
              import('@tauri-apps/api/event').then(({emit}) => {
                emit(TAURI_EVENTS.REQUEST.REFRESH_WORKSPACE, payload);
              });
              break;
            default:
              import('@tauri-apps/api/event').then(({emit}) => {
                emit(channel, payload);
              });
              break;
          }
        });
      });
    },

    on(channel: string, cb: (...args: any[]) => void): void {
      let set = internalCallbacks.get(channel);
      if (!set) {
        set = new Set();
        internalCallbacks.set(channel, set);
      }
      set.add(cb);

      import('@tauri-apps/api/event').then(({listen}) => {
        const unlistenPromise = listen(channel, event => {
          cb(event.payload);
        });

        let channelMap = listenersMap.get(channel);
        if (!channelMap) {
          channelMap = new Map();
          listenersMap.set(channel, channelMap);
        }
        channelMap.set(cb, unlistenPromise);
      });
    },

    removeListener(listener: string, cb: (...args: any[]) => void): void {
      internalCallbacks.get(listener)?.delete(cb);
      const channelMap = listenersMap.get(listener);
      const unlistenPromise = channelMap?.get(cb);
      if (channelMap && unlistenPromise) {
        unlistenPromise.then(unlisten => unlisten());
        channelMap.delete(cb);
      }
    },

    async getBackendPort(): Promise<string> {
      const {invoke} = await import('@tauri-apps/api/core');
      return await invoke<string>('get_backend_port');
    },

    async openPrintWindow(filePath: string): Promise<unknown> {
      const {invoke} = await import('@tauri-apps/api/core');
      return await invoke('open_print_window', {filePath});
    },

    async writePrintFile(content: string): Promise<string> {
      const {invoke} = await import('@tauri-apps/api/core');
      return await invoke<string>('write_print_file', {content});
    },

    async openExternalLink(link: string): Promise<void> {
      const {invoke} = await import('@tauri-apps/api/core');
      await invoke('open_external_link', {link});
    },

    async openInVsCodeOrDefault(vscodeUrl: string, filePath: string): Promise<void> {
      const {invoke} = await import('@tauri-apps/api/core');
      await invoke('open_in_vscode_or_default', {vscodeUrl, filePath});
    },

    showContextMenu(payload: TauriContextMenuPayload): void {
      import('@tauri-apps/api/core').then(({invoke}) => {
        invoke('show_context_menu', {href: payload?.href});
      });
    },

    copyToClipboard(text: string): void {
      import('@tauri-apps/api/core').then(({invoke}) => {
        invoke('copy_to_clipboard', {text});
      });
    },
  };
}

export const IPC_RENDERER = new InjectionToken<TauriApi | undefined>('TauriIpcRenderer', {
  providedIn: 'root',
  factory: () => {
    if (typeof window !== 'undefined') {
      if (window.tauriAPI || (window as any).tauriApi) {
        return window.tauriAPI || (window as any).tauriApi;
      }
      if ('__TAURI_INTERNALS__' in window || '__TAURI__' in window) {
        const bridge = createTauriBridge();
        window.tauriAPI = bridge;
        return bridge;
      }
    }
    return undefined;
  },
});
