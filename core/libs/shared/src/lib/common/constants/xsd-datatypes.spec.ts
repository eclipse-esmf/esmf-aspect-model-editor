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
import {isDataTypeLangString, simpleDataTypes} from './xsd-datatypes';

describe('XSD Datatypes Constants', () => {
  it('should identify langString type', () => {
    const mockLangStringType: any = {
      getUrn: () => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
    };
    const mockOtherType: any = {
      getUrn: () => 'http://www.w3.org/2001/XMLSchema#string',
    };

    expect(isDataTypeLangString(mockLangStringType)).toBe(true);
    expect(isDataTypeLangString(mockOtherType)).toBe(false);
    expect(isDataTypeLangString(null as any)).toBe(false);
  });

  it('should define simpleDataTypes definitions and descriptions', () => {
    expect(simpleDataTypes.string.isDefinedBy).toBe('http://www.w3.org/2001/XMLSchema#string');
    expect(simpleDataTypes.boolean.isDefinedBy).toBe('http://www.w3.org/2001/XMLSchema#boolean');
    expect(simpleDataTypes.integer.isDefinedBy).toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(simpleDataTypes.double.isDefinedBy).toBe('http://www.w3.org/2001/XMLSchema#double');
    expect(simpleDataTypes.curie.description).toBe('Compact URI/IRI (well-known prefix + element name)');
  });
});
