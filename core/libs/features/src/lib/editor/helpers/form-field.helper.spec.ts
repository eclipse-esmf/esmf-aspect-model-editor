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

import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEnumeration,
  DefaultProperty,
  DefaultScalar,
  DefaultTrait,
} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {DataType, FormFieldHelper} from './form-field.helper';

describe('FormFieldHelper', () => {
  const entity = new DefaultEntity({aspectModelUrn: 'urn:test#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
  const scalar = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.0.0'});

  it('should identify complex property when dataType is DefaultEntity', () => {
    const char = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test#Char',
      name: 'Char',
      dataType: entity,
      metaModelVersion: '2.0.0',
    });
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#Prop',
      name: 'Prop',
      characteristic: char,
      metaModelVersion: '2.0.0',
    });

    expect(FormFieldHelper.isComplexProperty(prop)).toBe(true);
    expect(FormFieldHelper.getDataType(prop)).toBe(DataType.COMPLEX);
  });

  it('should identify complex property wrapped in DefaultTrait', () => {
    const baseChar = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test#BaseChar',
      name: 'BaseChar',
      dataType: entity,
      metaModelVersion: '2.0.0',
    });
    const trait = new DefaultTrait({
      aspectModelUrn: 'urn:test#Trait',
      name: 'Trait',
      baseCharacteristic: baseChar,
      metaModelVersion: '2.0.0',
    });
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#Prop',
      name: 'Prop',
      characteristic: trait,
      metaModelVersion: '2.0.0',
    });

    expect(FormFieldHelper.isComplexProperty(prop)).toBe(true);
    expect(FormFieldHelper.getDataType(prop)).toBe(DataType.COMPLEX);
  });

  it('should return DEFAULT when property is not complex', () => {
    const char = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test#Char',
      name: 'Char',
      dataType: scalar,
      metaModelVersion: '2.0.0',
    });
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#Prop',
      name: 'Prop',
      characteristic: char,
      metaModelVersion: '2.0.0',
    });

    expect(FormFieldHelper.isComplexProperty(prop)).toBe(false);
    expect(FormFieldHelper.getDataType(prop)).toBe(DataType.DEFAULT);
  });

  it('should identify enumeration property', () => {
    const enumeration = new DefaultEnumeration({
      aspectModelUrn: 'urn:test#Enum',
      name: 'Enum',
      metaModelVersion: '2.0.0',
      values: [],
    });
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#Prop',
      name: 'Prop',
      characteristic: enumeration,
      metaModelVersion: '2.0.0',
    });

    expect(FormFieldHelper.isEnumerationProperty(prop)).toBe(true);
  });

  it('should identify enumeration property wrapped in trait', () => {
    const enumeration = new DefaultEnumeration({
      aspectModelUrn: 'urn:test#Enum',
      name: 'Enum',
      metaModelVersion: '2.0.0',
      values: [],
    });
    const trait = new DefaultTrait({
      aspectModelUrn: 'urn:test#Trait',
      name: 'Trait',
      baseCharacteristic: enumeration,
      metaModelVersion: '2.0.0',
    });
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#Prop',
      name: 'Prop',
      characteristic: trait,
      metaModelVersion: '2.0.0',
    });

    expect(FormFieldHelper.isEnumerationProperty(prop)).toBe(true);
  });

  it('should return false for null property or non-enumeration', () => {
    expect(FormFieldHelper.isComplexProperty(null)).toBe(false);
    expect(FormFieldHelper.isEnumerationProperty(null)).toBe(false);
  });
});
