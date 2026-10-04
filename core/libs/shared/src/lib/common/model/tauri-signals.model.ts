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
import {StartupData, StartupPayload, WindowSession} from './startup-options';

export interface TauriPayloadOnly {
  updateWindowInfo: StartupPayload;
  openWindow: StartupPayload;
  updateSession: WindowSession;
  setSessionRestoreEnabled: boolean;
}

export interface TauriReturnDataOnly {
  isFirstWindow: Observable<boolean>;
  requestMaximizeWindow: void;
  requestWindowData: Observable<StartupData>;
  requestRefreshWorkspaces: void;
}

export type TauriEventKeys = keyof TauriReturnDataOnly | keyof TauriPayloadOnly;
export type RegisteredTAURI_EVENTS = Partial<Record<TauriEventKeys, (payload?: unknown) => unknown>>;

export interface TauriSignals {
  call<K extends keyof TauriPayloadOnly>(listener: K, payload: TauriPayloadOnly[K]): void;
  call<K extends keyof TauriReturnDataOnly>(listener: K): TauriReturnDataOnly[K];

  addListener<K extends keyof TauriPayloadOnly>(listener: K, callback: (payload: TauriPayloadOnly[K]) => void): void;
  addListener<K extends keyof TauriReturnDataOnly>(listener: K, callback: () => TauriReturnDataOnly[K]): void;

  removeListener<K extends TauriEventKeys>(listener: K): void;
}
