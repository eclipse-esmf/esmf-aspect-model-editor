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
import * as log from 'loglevel';
import {LogLevelNumbers} from 'loglevel';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly prefix = '[AME]';
  private logInstance = log;

  constructor() {
    this.logInstance.setDefaultLevel('info');
  }

  logInfo(...msg: any[]) {
    this.logInstance.info(`${this.prefix}`, ...msg);
  }

  logDebug(...msg: any[]) {
    this.logInstance.debug(`${this.prefix}`, ...msg);
  }

  logWarn(...msg: any[]) {
    this.logInstance.warn(`${this.prefix}`, ...msg);
  }

  logError(...msg: any[]) {
    this.logInstance.error(`${this.prefix}`, ...msg);
  }

  getLogLevel(): number {
    return this.logInstance.getLevel();
  }

  setDefaultLevel(logLevel: LogLevelNumbers) {
    this.logInstance.setDefaultLevel(logLevel);
  }
}
