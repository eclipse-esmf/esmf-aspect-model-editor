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

import {
  GraphFilterRendererPort,
  GraphNavigatorPort,
  GraphSettingsPort,
  GraphValidationErrorHighlighterPort,
  UiShellStore,
} from '@ame/domain';
import {EnvironmentProviders, inject, Injector, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {watchState} from '@ngrx/signals';
import {ShapeConnectorService} from './connection';
import {
  MaxGraphDomainBridgeService,
  MaxGraphFilterRendererService,
  MaxGraphHelper,
  MaxGraphNavigatorService,
  MaxGraphService,
  MaxGraphSettingsBridgeService,
  ThemeService,
} from './max-graph';
import {GraphAdapterPort, ShapeConnectorPort} from './ports';

/**
 * Returns environment providers for all Aspect Model Editor graph services.
 */
export function provideAmeGraph(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: GraphFilterRendererPort, useExisting: MaxGraphFilterRendererService},
    {provide: GraphAdapterPort, useExisting: MaxGraphDomainBridgeService},
    {provide: ShapeConnectorPort, useExisting: ShapeConnectorService},
    {provide: GraphSettingsPort, useExisting: MaxGraphSettingsBridgeService},
    {provide: GraphValidationErrorHighlighterPort, useExisting: MaxGraphService},
    {provide: GraphNavigatorPort, useExisting: MaxGraphNavigatorService},
    provideEnvironmentInitializer(() => {
      MaxGraphHelper.injector = inject(Injector);
    }),
    provideEnvironmentInitializer(() => {
      const themeService = inject(ThemeService);
      // Synchronously apply theme changes so follow-up graph operations use the new colors.
      watchState(inject(UiShellStore), ({theme}) => {
        if (theme !== themeService.currentTheme) {
          themeService.applyTheme(theme);
        }
      });
    }),
  ]);
}
