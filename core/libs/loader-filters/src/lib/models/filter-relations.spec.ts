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

import {DefaultAspect, DefaultCharacteristic, DefaultProperty} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {ModelFilter} from './filter-loader.interface';
import {FilterRelation, filterRelations} from './filter-relations';

describe('FilterRelation', () => {
  it('should initialize with default empty exception arrays', () => {
    const relation = new FilterRelation(DefaultAspect, [DefaultProperty]);

    expect(relation.from).toBe(DefaultAspect);
    expect(relation.to).toEqual([DefaultProperty]);
    expect(relation.exceptInFilter[ModelFilter.DEFAULT]).toEqual([]);
    expect(relation.exceptInFilter[ModelFilter.PROPERTIES]).toEqual([]);
  });

  it('should detect exceptions for a given filter mode', () => {
    const relation = new FilterRelation(DefaultProperty, [DefaultCharacteristic], {
      [ModelFilter.PROPERTIES]: [DefaultProperty],
    });

    const property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#prop',
      name: 'prop',
      metaModelVersion: '2.0.0',
    });

    expect(relation.isExceptions(property, ModelFilter.PROPERTIES)).toBe(true);
    expect(relation.isExceptions(property, ModelFilter.DEFAULT)).toBe(false);
  });

  it('should have predefined filterRelations defined', () => {
    expect(filterRelations).toBeDefined();
    expect(filterRelations.length).toBeGreaterThan(0);
  });
});
