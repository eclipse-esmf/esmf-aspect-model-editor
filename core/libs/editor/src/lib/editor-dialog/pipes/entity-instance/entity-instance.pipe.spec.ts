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

import {DefaultEntityInstance} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, test} from 'vitest';
import {EntityInstancePipe} from './entity-instance.pipe';

describe('EntityInstancePipe', () => {
  let pipe: EntityInstancePipe;

  beforeEach(() => {
    pipe = new EntityInstancePipe();
  });

  test('should return null when value is null', () => {
    expect(pipe.transform(null, 'search')).toBeNull();
  });

  test('should return null when value is empty array', () => {
    expect(pipe.transform([], 'search')).toBeNull();
  });

  test('should return original array when search is empty', () => {
    const data: DefaultEntityInstance[] = [{name: 'item1'} as DefaultEntityInstance, {name: 'item2'} as DefaultEntityInstance];

    expect(pipe.transform(data, '')).toEqual(data);
  });

  test('should return matching items when search term matches name', () => {
    const data: DefaultEntityInstance[] = [
      {name: 'CarA'} as DefaultEntityInstance,
      {name: 'CarB'} as DefaultEntityInstance,
      {name: 'Truck'} as DefaultEntityInstance,
    ];

    const result = pipe.transform(data, 'Car');

    expect(result).toEqual([{name: 'CarA'}, {name: 'CarB'}]);
  });

  test('should return empty array when no match is found', () => {
    const data: DefaultEntityInstance[] = [{name: 'ItemA'} as DefaultEntityInstance, {name: 'ItemB'} as DefaultEntityInstance];

    const result = pipe.transform(data, 'XYZ');

    expect(result).toEqual([]);
  });
});
