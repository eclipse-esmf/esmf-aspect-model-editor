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
import {Elements, cellRelations} from './elements-relations';

describe('Elements Relations Constants', () => {
  it('should define Elements enum values', () => {
    expect(Elements.aspect).toBe('aspect');
    expect(Elements.property).toBe('property');
    expect(Elements.characteristic).toBe('characteristic');
    expect(Elements.entity).toBe('entity');
    expect(Elements.trait).toBe('trait');
    expect(Elements.unit).toBe('unit');
    expect(Elements.event).toBe('event');
    expect(Elements.operation).toBe('operation');
  });

  it('should define valid cellRelations mappings', () => {
    expect(cellRelations[Elements.aspect]).toContain(Elements.property);
    expect(cellRelations[Elements.property]).toContain(Elements.characteristic);
    expect(cellRelations[Elements.characteristic]).toContain(Elements.entity);
    expect(cellRelations[Elements.trait]).toContain(Elements.constraint);
    expect(cellRelations[Elements.constraint]).toEqual([]);
    expect(cellRelations[Elements.unit]).toEqual([]);
  });
});
