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
import {provideSearch} from '@ame/search';
import {provideSettings} from '@ame/settings';
import {APP_CONFIG, config, LanguageTranslationService, TauriTunnelPort} from '@ame/shared';
import {provideSidebar} from '@ame/sidebar';
import {EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer} from '@angular/core';
import {TauriTunnelService} from './tauri-tunnel.service';

/** Workbench providers: shell configuration plus all UI features and the domain. */
export function provideWorkbench(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: APP_CONFIG, useValue: config},
    {provide: TauriTunnelPort, useExisting: TauriTunnelService},
    provideAppInitializer(() => inject(LanguageTranslationService).preloadTranslation()),
    provideEditor(),
    provideSidebar(),
    provideSearch(),
    provideSettings(),
    provideAmeDomain(),
  ]);
}
