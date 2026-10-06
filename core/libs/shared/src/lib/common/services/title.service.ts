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

import {Injectable, signal} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class TitleService extends Title {
  public readonly activeAbsoluteName = signal<string>('');

  override setTitle(newTitle: string): void {
    super.setTitle(newTitle);
    if (typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window || (window as any).tauriApi)) {
      import('@tauri-apps/api/core')
        .then(({invoke}) => {
          invoke('set_window_title', {title: newTitle});
        })
        .catch(() => {});
    }
  }

  updateTitle(absoluteName: string) {
    if (!absoluteName) {
      return;
    }

    this.activeAbsoluteName.set(absoluteName);
    const [namespace, version, modelName] = absoluteName.split(':');
    const title = `${modelName} - ${namespace}:${version} | Aspect Model Editor`;
    this.setTitle(title);
  }
}
