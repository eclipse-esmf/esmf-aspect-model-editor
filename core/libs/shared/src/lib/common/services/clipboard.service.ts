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

import {DOCUMENT, inject, Injectable} from '@angular/core';
import {IPC_RENDERER} from '../tauri-ipc.provider';

/** Copies text to the system clipboard: via Tauri in the desktop app, otherwise via the browser clipboard. */
@Injectable({providedIn: 'root'})
export class ClipboardService {
  private readonly ipcRenderer = inject(IPC_RENDERER, {optional: true});
  private readonly document = inject(DOCUMENT);

  copy(text: string): void {
    if (!text) return;

    if (this.ipcRenderer?.copyToClipboard) {
      this.ipcRenderer.copyToClipboard(text);
    } else if (navigator.clipboard?.writeText && this.document.hasFocus()) {
      navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const textarea = this.document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    this.document.body.appendChild(textarea);
    textarea.select();
    this.document.execCommand('copy');
    this.document.body.removeChild(textarea);
  }
}
