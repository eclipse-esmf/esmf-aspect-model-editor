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

import {ELEMENT_MODEL_SERVICE, FILTER_ATTRIBUTES, FILTERS_SERVICE, MODEL_ELEMENT_NAMING_SERVICE} from '@ame/shared';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {createFilterAttributes} from './loader-filters/active-filter.session';
import {FiltersService} from './loader-filters/filters.service';
import {ElementModelService} from './meta-model/element-service/element-model.service';
import {ModelElementNamingService} from './meta-model/services/model-element-naming.service';

/**
 * Returns environment providers for all Aspect Model Editor domain services.
 * Binds domain implementations to their respective shared injection tokens.
 */
export function provideAmeDomain(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: FILTER_ATTRIBUTES, useFactory: createFilterAttributes},
    {provide: FILTERS_SERVICE, useExisting: FiltersService},
    {provide: ELEMENT_MODEL_SERVICE, useExisting: ElementModelService},
    {provide: MODEL_ELEMENT_NAMING_SERVICE, useExisting: ModelElementNamingService},
  ]);
}
