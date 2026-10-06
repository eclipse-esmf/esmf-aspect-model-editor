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

import {describe, expect, it} from 'vitest';
import {SearchService} from './search.service';

describe('SearchService', () => {
  const service = new SearchService();
  const testList = [{name: 'AspectModel'}, {name: 'PropertyEntity'}, {name: 'Characteristic'}];
  const options = {keys: ['name'], threshold: 0.2};

  it('createSearcher and searchByValue should find matching items', () => {
    const searcher = service.createSearcher(testList, options);
    const results = service.searchByValue('Aspect', searcher);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('AspectModel');
  });

  it('search should return filtered list or original list if value is empty', () => {
    const results = service.search('Entity', testList, options);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('PropertyEntity');

    const allResults = service.search('', testList, options);
    expect(allResults).toEqual(testList);
  });

  it('adaptForSpecialSearch should replace * with single quote', () => {
    const adapted = (service as any).adaptForSpecialSearch('*Model');
    expect(adapted).toBe("'Model");
  });

  it('adaptForSpecialSearch should return empty string if input starts with single quote', () => {
    const adapted = (service as any).adaptForSpecialSearch("'Model");
    expect(adapted).toBe('');
  });
});
