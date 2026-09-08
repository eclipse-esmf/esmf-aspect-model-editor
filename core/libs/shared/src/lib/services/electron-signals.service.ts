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
import {ElectronEventKeys, ElectronPayloadOnly, ElectronReturnDataOnly, ElectronSignals, RegisteredELECTRON_EVENTS} from '../model';

@Injectable({providedIn: 'root'})
export class ElectronSignalsService implements ElectronSignals {
  private listeners: RegisteredELECTRON_EVENTS = {};

  addListener<K extends keyof ElectronPayloadOnly>(listener: K, callback: (payload: ElectronPayloadOnly[K]) => void): void;
  addListener<K extends keyof ElectronReturnDataOnly>(listener: K, callback: () => ElectronReturnDataOnly[K]): void;
  addListener<K extends ElectronEventKeys>(listener: K, callback: (payload?: unknown) => unknown): void {
    if (typeof callback === 'function') {
      this.listeners[listener] = callback;
      return;
    }

    throw new Error('callback parameter should be of type Function');
  }

  call<K extends keyof ElectronPayloadOnly>(action: K, payload: ElectronPayloadOnly[K]): void;
  call<K extends keyof ElectronReturnDataOnly>(action: K): ElectronReturnDataOnly[K];
  call(action: ElectronEventKeys, data?: unknown): unknown {
    if (!this.listeners[action]) {
      console.error('No listener registered for ' + action);
      return null;
    }

    return this.listeners[action](data);
  }

  removeListener<K extends ElectronEventKeys>(listener: K): void {
    delete this.listeners[listener];
  }
}
