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

import {Directive, inject} from '@angular/core';
import {BrowserService} from '../services/browser.service';
import {IPC_RENDERER} from '../tauri-ipc.provider';

/**
 * Opens `<a href target="_blank">` links in the system browser when running inside Tauri.
 *
 * In a regular browser the anchor's default behavior (new tab) is kept. Inside Tauri the click is
 * consumed here, because tauri-plugin-shell also opens every `target="_blank"` link from a global
 * click listener (ignoring `defaultPrevented`), which would otherwise open the link twice.
 */
@Directive({
  selector: 'a[ameExternalLink]',
  host: {'(click)': 'onClick($event)'},
})
export class ExternalLinkDirective {
  private readonly browserService = inject(BrowserService);
  private readonly ipcRenderer = inject(IPC_RENDERER, {optional: true});

  onClick(event: MouseEvent): void {
    if (!this.browserService.isStartedAsTauriApp() || !this.ipcRenderer) return;

    const href = (event.currentTarget as HTMLAnchorElement | null)?.href;
    if (!href) return;

    event.preventDefault();
    event.stopPropagation();
    Promise.resolve(this.ipcRenderer.openExternalLink(href)).catch(error => console.error(`Failed to open external link ${href}`, error));
  }
}
