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
import {XsdDataTypes} from './xsd-datatypes';

describe('XsdDataTypes', () => {
  it('should get default XSD datatypes for 2.0.0', () => {
    const xsd = new XsdDataTypes('2.0.0');
    const types = xsd.getDataTypes();

    expect(types).toBeDefined();
    expect(types['string']).toBeDefined();
    expect(types['string'].isDefinedBy).toContain('string');
  });

  it('should find specific datatype by key', () => {
    const xsd = new XsdDataTypes('2.0.0');
    const stringType = xsd.getDataType('string');

    expect(stringType).toBeDefined();
    expect(stringType.isDefinedBy).toBe('http://www.w3.org/2001/XMLSchema#string');
  });

  it('should interpolate model version for curie type', () => {
    const xsd = new XsdDataTypes('2.0.0');
    const curieType = xsd.getDataType('curie');

    expect(curieType).toBeDefined();
    expect(curieType.isDefinedBy).toContain('2.0.0');
  });
});
