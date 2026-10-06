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

import {computed, inject, Injectable, signal} from '@angular/core';
import {APP_CONFIG} from '../config';
import {TAURI_EVENTS} from '../enums';
import {BackendStatus} from '../model/tauri-api.model';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {BrowserService} from './browser.service';

/**
 * Tracks the lifecycle of the backend that is started by the desktop shell.
 * In the browser (backend started externally) the backend is always considered ready.
 */
@Injectable({providedIn: 'root'})
export class BackendStatusService {
  private readonly ipcRenderer = inject(IPC_RENDERER);
  private readonly browserService = inject(BrowserService);
  private readonly config = inject(APP_CONFIG);

  private readonly isDesktop = this.browserService.isStartedAsTauriApp() && !!this.ipcRenderer;
  private readonly isE2e = typeof window !== 'undefined' && window.location.search.includes('?e2e=true');

  private readonly _status = signal<BackendStatus>({
    state: this.isDesktop ? 'starting' : 'ready',
    port: this.config.defaultPort,
    message: null,
    revision: -1,
  });
  private readonly _hasBeenReady = signal(!this.isDesktop);
  private readonly _retrying = signal(false);

  readonly status = this._status.asReadonly();
  readonly isReady = computed(() => this._status().state === 'ready');
  /** Stays true once the backend was ready, so a later crash does not tear down the loaded editor. */
  readonly hasBeenReady = this._hasBeenReady.asReadonly();
  readonly retrying = this._retrying.asReadonly();
  readonly serviceUrl = computed(() => {
    const port = this._status().port;
    return this.isDesktop && !this.isE2e && port ? this.config.serviceUrl.replace(this.config.defaultPort, port) : this.config.serviceUrl;
  });

  constructor() {
    if (this.isDesktop) {
      this.connect();
    }
  }

  retry(): void {
    if (this._retrying() || this._status().state !== 'failed') {
      return;
    }

    this._retrying.set(true);
    this.ipcRenderer
      .retryBackendStart()
      .then(status => this.apply(status))
      .catch(error => this.fail(error))
      .finally(() => this._retrying.set(false));
  }

  quit(): void {
    this.ipcRenderer.quitApp().catch(error => console.error('Unable to quit the application', error));
  }

  private connect(): void {
    if (typeof this.ipcRenderer.getBackendStatus !== 'function') {
      // Older shells only expose the port and do not report readiness.
      this.ipcRenderer.getBackendPort().then(port => this.apply({state: 'ready', port, message: null, revision: 0}));
      return;
    }

    this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.BACKEND_STATUS, (status: BackendStatus) => this.apply(status));
    this.ipcRenderer
      .getBackendStatus()
      .then(status => this.apply(status))
      .catch(error => this.fail(error));
  }

  private apply(status: BackendStatus): void {
    if (!status || status.revision < this._status().revision) {
      return;
    }

    this._status.set(status);
    if (status.state === 'ready') {
      this._hasBeenReady.set(true);
    }
  }

  private fail(error: unknown): void {
    const current = this._status();
    this._status.set({
      ...current,
      state: 'failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
