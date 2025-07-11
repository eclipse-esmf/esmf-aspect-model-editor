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

import {Observable} from 'rxjs';
import {StartupData, StartupPayload} from './startup-options';

export type LockUnlockPayload = Omit<StartupPayload, 'fromWorkspace' | 'editElement'>;

interface ElectronPayloadOnly {
  updateWindowInfo: StartupPayload;
  openWindow: StartupPayload;
  addLock: LockUnlockPayload;
  removeLock: LockUnlockPayload;
}

interface ElectronReturnDataOnly {
  isFirstWindow: Observable<boolean>;
  requestMaximizeWindow: void;
  requestWindowData: Observable<StartupData>;
  requestRefreshWorkspaces: void;
  lockedFiles: Observable<LockUnlockPayload[]>;
}

type GenericPayloadAndReturn<Payload, Return> = {
  payload: Payload;
  return: Return;
};

type ElectronPayloadAndReturn = {
  lockFile: GenericPayloadAndReturn<LockUnlockPayload, Observable<string>>;
  unlockFile: GenericPayloadAndReturn<LockUnlockPayload, Observable<string>>;
};

export type ElectronEventKeys = keyof ElectronReturnDataOnly | keyof ElectronPayloadOnly | keyof ElectronPayloadAndReturn;
export type RegisteredElectronEvents = Partial<Record<ElectronEventKeys, Function>>;

export interface ElectronSignals {
  call<K extends keyof ElectronPayloadOnly>(listener: K, payload: ElectronPayloadOnly[K]): void;
  call<K extends keyof ElectronReturnDataOnly>(listener: K): ElectronReturnDataOnly[K];
  call<K extends keyof ElectronPayloadAndReturn>(
    listener: K,
    payload: ElectronPayloadAndReturn[K]['payload'],
  ): ElectronPayloadAndReturn[K]['return'];

  addListener<K extends keyof ElectronPayloadOnly>(listener: K, callback: (payload: ElectronPayloadOnly[K]) => void): void;
  addListener<K extends ElectronEventKeys>(listener: K, callback: () => void): void;
  addListener<K extends keyof ElectronPayloadAndReturn>(
    listener: K,
    callback: (payload: ElectronPayloadAndReturn[K]['payload']) => ElectronPayloadAndReturn[K]['return'],
  ): void;

  removeListener<K extends ElectronEventKeys>(listener: K, callback: Function): void;
}
