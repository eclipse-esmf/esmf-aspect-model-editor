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
import {
  EDITOR_THEME_SERVICE,
  GRAPH_ADAPTER,
  GRAPH_FILTER_RENDERER,
  GRAPH_VALIDATION_ERROR_HIGHLIGHTER,
  MAX_GRAPH_SETTINGS_SERVICE,
  SHAPE_CONNECTOR_SERVICE,
} from '@ame/shared';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {ShapeConnectorService} from './connection';
import {
  MaxGraphDomainBridgeService,
  MaxGraphFilterRendererService,
  MaxGraphService,
  MaxGraphSettingsBridgeService,
  ThemeService,
} from './max-graph';

/**
 * Returns environment providers for all Aspect Model Editor graph services,
 * and delegates to provideAmeDomain() to bundle graph and domain capabilities.
 */
export function provideAmeGraph(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: GRAPH_FILTER_RENDERER, useExisting: MaxGraphFilterRendererService},
    {provide: GRAPH_ADAPTER, useExisting: MaxGraphDomainBridgeService},
    {provide: SHAPE_CONNECTOR_SERVICE, useExisting: ShapeConnectorService},
    {provide: EDITOR_THEME_SERVICE, useExisting: ThemeService},
    {provide: MAX_GRAPH_SETTINGS_SERVICE, useExisting: MaxGraphSettingsBridgeService},
    {provide: GRAPH_VALIDATION_ERROR_HIGHLIGHTER, useExisting: MaxGraphService},
    provideAmeDomain(),
  ]);
}
