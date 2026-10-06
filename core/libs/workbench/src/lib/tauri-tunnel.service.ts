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

import {
  IPC_RENDERER,
  LanguageTranslationService,
  NotificationsService,
  StartupData,
  StartupPayload,
  TAURI_EVENTS,
  TAURI_IPC_BRIDGES,
  TauriSignals,
  TauriSignalsService,
  TauriTunnelPort,
  WindowSession,
} from '@ame/shared';
import {Injectable, inject} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';

/**
 * Shell-level Tauri integration: window lifecycle, notifications and menu translations.
 * Feature specific menu/IPC events are handled by feature bridges registered via TAURI_IPC_BRIDGES.
 */
@Injectable({providedIn: 'root'})
export class TauriTunnelService implements TauriTunnelPort {
  private ipcRenderer = inject(IPC_RENDERER);
  private tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private notificationsService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);
  private bridges = inject(TAURI_IPC_BRIDGES, {optional: true}) ?? [];

  public startUpData$ = new BehaviorSubject<{isFirstWindow: boolean; model: string; session?: WindowSession; windowId?: string}>(null);

  sendTranslationsToTauri(language: string, customMenuItem?: any): void {
    this.translate.getTranslation(language).subscribe(translation => {
      this.ipcRenderer?.send(TAURI_EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS, {
        id: 'TRANSLATE_MENU_ITEMS',
        payload: {translation: translation, customMenuItem: customMenuItem},
      });
    });
  }

  public subscribeMessages(): void {
    if (!this.ipcRenderer) return;
    this.setListeners();
    this.registerIpcEvents();
    this.bridges.forEach(bridge => bridge.register());
  }

  private setListeners(): void {
    this.ipcRenderer.send(TAURI_EVENTS.SIGNAL.WINDOW_FOCUS);
    this.tauriSignalsService.addListener('updateWindowInfo', payload => this.updateWindowInfo(payload));
    this.tauriSignalsService.addListener('openWindow', payload => this.openWindow(payload));
    this.tauriSignalsService.addListener('isFirstWindow', () => this.isFirstWindow());
    this.tauriSignalsService.addListener('requestMaximizeWindow', () => this.requestMaximizeWindow());
    this.tauriSignalsService.addListener('requestWindowData', () => this.requestWindowData());
    this.tauriSignalsService.addListener('requestRefreshWorkspaces', () => this.requestRefreshWorkspaces());
    this.tauriSignalsService.addListener('updateSession', payload => this.ipcRenderer?.send(TAURI_EVENTS.REQUEST.UPDATE_SESSION, payload));
    this.tauriSignalsService.addListener('setSessionRestoreEnabled', enabled =>
      this.ipcRenderer?.send(TAURI_EVENTS.REQUEST.SET_SESSION_RESTORE, enabled),
    );
  }

  private registerIpcEvents(): void {
    this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.BACKEND_STARTUP_ERROR, () => {
      this.notificationsService.error({title: 'Backend not started. Try to reopen the application'});
    });
    this.ipcRenderer.on(TAURI_EVENTS.REQUEST.SHOW_NOTIFICATION, (message: string) => {
      this.notificationsService.info({title: message});
    });
    this.ipcRenderer.on(TAURI_EVENTS.SIGNAL.NEW_WINDOW, () => this.tauriSignalsService.call('openWindow', null));
  }

  private updateWindowInfo(options: StartupPayload): void {
    this.ipcRenderer?.send(TAURI_EVENTS.REQUEST.UPDATE_DATA, options);
  }

  private openWindow(config?: StartupPayload): void {
    if (!this.ipcRenderer) {
      this.notificationsService.error({
        title: 'Application not opened in tauri',
        message: 'To open a new window, please open the application through tauri',
      });
      return;
    }
    this.ipcRenderer.send(TAURI_EVENTS.REQUEST.CREATE_WINDOW, config);
  }

  private isFirstWindow(): Observable<boolean> {
    if (!this.ipcRenderer) return of(true);
    return new Observable(observer => {
      const executorFn = (result: boolean) => {
        observer.next(result);
        this.ipcRenderer.removeListener(TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.IS_FIRST_WINDOW, executorFn);
      this.ipcRenderer.send(TAURI_EVENTS.REQUEST.IS_FIRST_WINDOW);
    });
  }

  private requestWindowData(): Observable<StartupData> {
    if (!this.ipcRenderer) return of(null);
    return new Observable(observer => {
      const executorFn = (data: StartupData) => {
        observer.next(data);
        this.ipcRenderer.removeListener(TAURI_EVENTS.RESPONSE.WINDOW_DATA, executorFn);
        observer.complete();
      };
      this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.WINDOW_DATA, executorFn);
      this.ipcRenderer.send(TAURI_EVENTS.REQUEST.WINDOW_DATA);
    });
  }

  private requestMaximizeWindow(): void {
    this.ipcRenderer?.send(TAURI_EVENTS.REQUEST.MAXIMIZE_WINDOW);
  }

  private requestRefreshWorkspaces(): void {
    this.ipcRenderer?.send(TAURI_EVENTS.SIGNAL.REFRESH_WORKSPACE);
  }
}
