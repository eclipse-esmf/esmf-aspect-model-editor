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

import {TestBed} from '@angular/core/testing';
import {firstValueFrom} from 'rxjs';
import {describe, expect, it} from 'vitest';
import {FILTER_ATTRIBUTES, FilterAttributesService} from './active-filter.session';
import {ModelFilter} from './models';

describe('FILTER_ATTRIBUTES InjectionToken', () => {
  it('should provide a default FilterAttributes instance with DEFAULT filter', async () => {
    const service: FilterAttributesService = TestBed.inject(FILTER_ATTRIBUTES);

    expect(service).toBeTruthy();
    expect(service.activeFilter).toBe(ModelFilter.DEFAULT);
    expect(service.isFiltering).toBe(false);

    const initial = await firstValueFrom(service.activeFilter$);
    expect(initial).toBe(ModelFilter.DEFAULT);
  });

  it('should update activeFilter and emit through activeFilter$', async () => {
    const service: FilterAttributesService = TestBed.inject(FILTER_ATTRIBUTES);

    service.activeFilter = ModelFilter.PROPERTIES;
    service.isFiltering = true;

    expect(service.activeFilter).toBe(ModelFilter.PROPERTIES);
    expect(service.isFiltering).toBe(true);

    const emitted = await firstValueFrom(service.activeFilter$);
    expect(emitted).toBe(ModelFilter.PROPERTIES);
  });
});
