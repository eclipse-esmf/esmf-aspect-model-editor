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
import {TAURI_EVENTS} from '../enums';
import {OpenModelsSnapshot, OpenWindowModels, SessionModelInfo} from '../model/startup-options';
import {IPC_RENDERER} from '../tauri-ipc.provider';
import {BrowserService} from './browser.service';

/**
 * Knows which workspace models are open in the other windows of the desktop application, e.g. to prevent deleting
 * a model another window shows. In the browser there are no other windows.
 */
@Injectable({providedIn: 'root'})
export class OtherWindowsModelsService {
  private readonly ipcRenderer = inject(IPC_RENDERER);
  private readonly browserService = inject(BrowserService);

  private readonly ownLabel = signal<string | null>(null);
  private readonly windows = signal<OpenWindowModels[]>([]);

  /** Models open in other windows. Empty until the own window is known, so the own models are never counted. */
  readonly models = computed<SessionModelInfo[]>(() => {
    const ownLabel = this.ownLabel();
    return ownLabel === null ? [] : this.windows().flatMap(window => (window.label === ownLabel ? [] : window.models));
  });

  constructor() {
    if (this.browserService.isStartedAsTauriApp() && typeof this.ipcRenderer?.getOpenModels === 'function') {
      this.connect();
    }
  }

  /** Whether the file `fileName` of the namespace version `namespaceKey` (`org.example:1.0.0`) is open in another window. */
  isFileOpen(namespaceKey: string, fileName: string): boolean {
    return this.models().some(model => model.namespace === namespaceKey && model.file === fileName);
  }

  /** Whether any file of the namespace version is open in another window. */
  isNamespaceOpen(namespaceKey: string): boolean {
    return this.models().some(model => model.namespace === namespaceKey);
  }

  /** Whether another window shows any workspace model. */
  hasOpenModels(): boolean {
    return this.models().length > 0;
  }

  private connect(): void {
    let updated = false;
    this.ipcRenderer.on(TAURI_EVENTS.RESPONSE.OPEN_MODELS, (windows: OpenWindowModels[]) => {
      updated = true;
      this.windows.set(windows ?? []);
    });
    this.ipcRenderer
      .getOpenModels()
      .then((snapshot: OpenModelsSnapshot) => {
        this.ownLabel.set(snapshot?.windowLabel ?? '');
        // An update pushed meanwhile is newer than the answer.
        if (!updated) this.windows.set(snapshot?.windows ?? []);
      })
      .catch(error => console.error('Unable to get the models of the other windows', error));
  }
}
