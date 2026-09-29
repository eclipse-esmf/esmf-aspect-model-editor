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

import {APP_CONFIG, config, TauriTunnelPort} from '@ame/shared';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {TauriTunnelService} from './tauri-tunnel.service';

/** Shell-level providers: app configuration and the Tauri tunnel. */
export function provideWorkbench(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: APP_CONFIG, useValue: config},
    {provide: TauriTunnelPort, useExisting: TauriTunnelService},
  ]);
}
