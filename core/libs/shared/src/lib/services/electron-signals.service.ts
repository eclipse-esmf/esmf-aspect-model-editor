/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {Observable} from 'rxjs';
import {ElectronEventKeys, ElectronSignals, RegisteredElectronEvents} from '../model';

@Injectable({providedIn: 'root'})
export class ElectronSignalsService implements ElectronSignals {
  private listeners: RegisteredElectronEvents = {};

  addListener(listener: ElectronEventKeys, callback: Function) {
    if (typeof callback === 'function') {
      this.listeners[listener] = callback;
      return;
    }

    throw new Error('callback parameter should be of type Function');
  }

  call(action: ElectronEventKeys, data?: any): Observable<any> {
    if (!this.listeners[action]) {
      console.error('No listener registered for ' + action);
      return null;
    }

    return this.listeners[action](data);
  }

  removeListener<K extends ElectronEventKeys>(listener: K) {
    this.listeners[listener] = null;
  }
}
