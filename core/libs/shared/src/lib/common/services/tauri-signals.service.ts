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
import {RegisteredTAURI_EVENTS, TauriEventKeys, TauriPayloadOnly, TauriReturnDataOnly, TauriSignals} from '../model';

@Injectable({providedIn: 'root'})
export class TauriSignalsService implements TauriSignals {
  private listeners: RegisteredTAURI_EVENTS = {};

  addListener<K extends keyof TauriPayloadOnly>(listener: K, callback: (payload: TauriPayloadOnly[K]) => void): void;
  addListener<K extends keyof TauriReturnDataOnly>(listener: K, callback: () => TauriReturnDataOnly[K]): void;
  addListener<K extends TauriEventKeys>(listener: K, callback: (payload?: unknown) => unknown): void {
    if (typeof callback === 'function') {
      this.listeners[listener] = callback;
      return;
    }

    throw new Error('callback parameter should be of type Function');
  }

  call<K extends keyof TauriPayloadOnly>(action: K, payload: TauriPayloadOnly[K]): void;
  call<K extends keyof TauriReturnDataOnly>(action: K): TauriReturnDataOnly[K];
  call(action: TauriEventKeys, data?: unknown): unknown {
    if (!this.listeners[action]) {
      console.error('No listener registered for ' + action);
      return null;
    }

    return this.listeners[action](data);
  }

  removeListener<K extends TauriEventKeys>(listener: K): void {
    delete this.listeners[listener];
  }
}
