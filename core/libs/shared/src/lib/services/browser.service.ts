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

import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class BrowserService {
  isStartedAsElectronApp() {
    if (typeof window !== 'undefined' && typeof window.process === 'object' && (<any>window.process).type === 'renderer') {
      return true;
    }

    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
      return true;
    }

    return typeof navigator === 'object' && navigator.userAgent.indexOf('Electron') >= 0;
  }

  getAssetBasePath(): string {
    return this.isStartedAsElectronApp() ? './assets' : '../../../assets';
  }
}
