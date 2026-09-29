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

import {InjectionToken} from '@angular/core';

export abstract class TauriTunnelPort {
  abstract sendTranslationsToTauri(language: string, customMenuItem?: any): void;
}

/**
 * Feature-owned handlers for Tauri IPC/menu events. Each feature registers its own bridge (multi provider),
 * the shell only triggers registration once the IPC renderer is available.
 */
export interface ITauriIpcBridge {
  register(): void;
}

export const TAURI_IPC_BRIDGES = new InjectionToken<ITauriIpcBridge[]>('TAURI_IPC_BRIDGES');
