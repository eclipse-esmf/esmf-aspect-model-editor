/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly prefix = '[AME]';

  logInfo(...msg: any[]) {
    // eslint-disable-next-line no-restricted-syntax
    console.info(`${this.prefix}`, ...msg);
  }

  logDebug(...msg: any[]) {
    // eslint-disable-next-line no-restricted-syntax
    console.debug(`${this.prefix}`, ...msg);
  }

  logWarn(...msg: any[]) {
    // eslint-disable-next-line no-restricted-syntax
    console.warn(`${this.prefix}`, ...msg);
  }

  logError(...msg: any[]) {
    // eslint-disable-next-line no-restricted-syntax
    console.error(`${this.prefix}`, ...msg);
  }
}
