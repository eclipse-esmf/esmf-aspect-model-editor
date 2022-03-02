/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Injectable} from '@angular/core';
import * as log from 'loglevel';
import {LogLevelNumbers} from 'loglevel';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly prefix = '[BAME]';
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
