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
import {DataTypeService} from './data-type.service';

describe('DataTypeService', () => {
  const service = new DataTypeService();

  it('should return all simple data types', () => {
    const dataTypes = service.getDataTypes();
    expect(dataTypes).toBeTruthy();
    expect(dataTypes.string).toBeTruthy();
    expect(dataTypes.boolean).toBeTruthy();
    expect(dataTypes.curie.isDefinedBy).toContain('2.2.0');
  });

  it('should return specific data type by key', () => {
    const stringType = service.getDataType('string');
    expect(stringType.isDefinedBy).toBe('http://www.w3.org/2001/XMLSchema#string');
  });
});
