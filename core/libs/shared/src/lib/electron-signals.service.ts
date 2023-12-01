/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {StartupData, StartupPayload} from './model';
import {Observable} from 'rxjs';

interface ElectronPayloadEvents {
  setWindowInfo: StartupData;
  updateWindowInfo: StartupPayload;
  openWindow: StartupPayload;
}

interface ElectronDataEvents {
  isFirstWindow: Observable<boolean>;
  requestStartupData: Observable<StartupData>;
  requestRefreshWorkspaces: undefined;
}

type ElectronEventDataKeys = keyof ElectronPayloadEvents;
type ElectronEventNoDataKeys = keyof ElectronDataEvents;
type ElectronEventKeys = ElectronEventDataKeys | ElectronEventNoDataKeys;
type RegisteredElectronEvents = Partial<Record<ElectronEventKeys, Function>>;

export interface ElectronSignals {
  call<K extends keyof ElectronPayloadEvents>(listener: K, config: ElectronPayloadEvents[K]): void;
  call<K extends ElectronEventNoDataKeys>(listener: K): ElectronDataEvents[K];

  addListener<K extends keyof ElectronPayloadEvents>(listener: K, callback: (payload: ElectronPayloadEvents[K]) => void): void;
  addListener<K extends ElectronEventNoDataKeys>(listener: K, callback: () => void): void;

  removeListener<K extends ElectronEventKeys>(listener: K, callback: Function): void;
}

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

  call<K extends ElectronEventDataKeys>(action: ElectronEventKeys, data?: ElectronPayloadEvents[K]): Observable<any> {
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
