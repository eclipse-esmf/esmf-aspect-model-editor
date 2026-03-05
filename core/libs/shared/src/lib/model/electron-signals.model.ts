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

import {Observable} from 'rxjs';
import {StartupData, StartupPayload} from './startup-options';

interface ElectronPayloadOnly {
  updateWindowInfo: StartupPayload;
  openWindow: StartupPayload;
}

interface ElectronReturnDataOnly {
  isFirstWindow: Observable<boolean>;
  requestMaximizeWindow: void;
  requestWindowData: Observable<StartupData>;
  requestRefreshWorkspaces: void;
}

export type ElectronEventKeys = keyof ElectronReturnDataOnly | keyof ElectronPayloadOnly;
export type RegisteredELECTRON_EVENTS = Partial<Record<ElectronEventKeys, Function>>;

export interface ElectronSignals {
  call<K extends keyof ElectronPayloadOnly>(listener: K, payload: ElectronPayloadOnly[K]): void;
  call<K extends keyof ElectronReturnDataOnly>(listener: K): ElectronReturnDataOnly[K];

  addListener<K extends keyof ElectronPayloadOnly>(listener: K, callback: (payload: ElectronPayloadOnly[K]) => void): void;
  addListener<K extends ElectronEventKeys>(listener: K, callback: () => void): void;

  removeListener<K extends ElectronEventKeys>(listener: K, callback: Function): void;
}
