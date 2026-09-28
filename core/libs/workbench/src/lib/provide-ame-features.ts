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

import {provideAmeDomain} from '@ame/domain';
import {provideEditor} from '@ame/editor';
import {provideAmeGraph} from '@ame/graph';
import {provideAmeInfrastructure} from '@ame/infrastructure';
import {provideSearch} from '@ame/search';
import {provideSettings} from '@ame/settings';
import {APP_CONFIG, config, TAURI_TUNNEL_SERVICE} from '@ame/shared';
import {provideSidebar} from '@ame/sidebar';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {TauriTunnelService} from './tauri-tunnel.service';

/**
 * Composition root of the Aspect Model Editor: every feature contributes its own providers,
 * the shell only adds app-level configuration and the Tauri tunnel.
 */
export function provideAmeFeatures(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: APP_CONFIG, useValue: config},
    {provide: TAURI_TUNNEL_SERVICE, useExisting: TauriTunnelService},
    provideEditor(),
    provideSidebar(),
    provideSearch(),
    provideSettings(),
    provideAmeGraph(),
    provideAmeInfrastructure(),
    provideAmeDomain(),
  ]);
}
