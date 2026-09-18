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
import {DefaultCharacteristic, DefaultScalar, DefaultValue, ElementSet} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it} from 'vitest';
import {ValueTypeResolverService} from './value-type-resolver.service';

describe('ValueTypeResolverService', () => {
  let service: ValueTypeResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValueTypeResolverService],
    });
    service = TestBed.inject(ValueTypeResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Formatting values', () => {
    it('should format integer values without quotes', () => {
      const intType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#integer', metaModelVersion: '2.1.0'});
      const val = new DefaultValue({
        name: 'v1',
        value: '123',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#v1',
        type: intType,
      });
      const resolution = service.resolveValueType(val);
      expect(service.formatValue(val.value, resolution)).toBe('123');
    });

    it('should format boolean values without quotes', () => {
      const boolType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#boolean', metaModelVersion: '2.1.0'});
      const val = new DefaultValue({
        name: 'v1',
        value: 'true',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#v1',
        type: boolType,
      });
      const resolution = service.resolveValueType(val);
      expect(service.formatValue(val.value, resolution)).toBe('true');
    });

    it('should format string values with quotes', () => {
      const strType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.1.0'});
      const val = new DefaultValue({
        name: 'v1',
        value: 'hello',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#v1',
        type: strType,
      });
      const resolution = service.resolveValueType(val);
      expect(service.formatValue(val.value, resolution)).toBe('"hello"');
    });
  });

  describe('Validation', () => {
    it('should validate integers', () => {
      const intType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#integer', metaModelVersion: '2.1.0'});
      const val = new DefaultValue({
        name: 'v1',
        value: '123',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#v1',
        type: intType,
      });
      const resolution = service.resolveValueType(val);

      expect(service.validateValue('123', resolution)).toBeNull();
      expect(service.validateValue('-456', resolution)).toBeNull();
      expect(service.validateValue('abc', resolution)).toEqual({
        kind: 'invalidInteger',
        message: 'Value must be a valid integer',
      });
      expect(service.validateValue('12.34', resolution)).toEqual({
        kind: 'invalidInteger',
        message: 'Value must be a valid integer',
      });
    });

    it('should validate booleans', () => {
      const boolType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#boolean', metaModelVersion: '2.1.0'});
      const val = new DefaultValue({
        name: 'v1',
        value: 'true',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#v1',
        type: boolType,
      });
      const resolution = service.resolveValueType(val);

      expect(service.validateValue('true', resolution)).toBeNull();
      expect(service.validateValue('false', resolution)).toBeNull();
      expect(service.validateValue('yes', resolution)).toEqual({
        kind: 'invalidBoolean',
        message: 'Value must be "true" or "false"',
      });
    });
  });

  describe('Priority hierarchy and conflict detection', () => {
    it('should detect standalone values without connected characteristics', () => {
      const val = new DefaultValue({name: 'v1', value: '100', metaModelVersion: '2.1.0', aspectModelUrn: 'urn:example:Test#v1'});
      const resolution = service.resolveValueType(val);

      expect(resolution.source).toBe('standalone');
      expect(resolution.canSelectDataType).toBe(true);
      expect(resolution.isReadOnly).toBe(false);
      expect(resolution.hasConflict).toBe(false);
    });

    it('should derive type from a single connected Characteristic', () => {
      const intType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#integer', metaModelVersion: '2.1.0'});
      const char = new DefaultCharacteristic({
        name: 'c1',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#c1',
        dataType: intType,
      });
      const val = new DefaultValue({name: 'v1', value: '100', metaModelVersion: '2.1.0', aspectModelUrn: 'urn:example:Test#v1'});
      val.parents = new ElementSet(char);

      const resolution = service.resolveValueType(val);
      expect(resolution.source).toBe('single-parent');
      expect(resolution.shortType).toBe('integer');
      expect(resolution.canSelectDataType).toBe(false);
      expect(resolution.hasConflict).toBe(false);
    });

    it('should detect conflicting types from multiple connected Characteristics', () => {
      const intType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#integer', metaModelVersion: '2.1.0'});
      const strType = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.1.0'});

      const char1 = new DefaultCharacteristic({
        name: 'c1',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#c1',
        dataType: intType,
      });
      const char2 = new DefaultCharacteristic({
        name: 'c2',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#c2',
        dataType: strType,
      });

      const val = new DefaultValue({name: 'v1', value: '100', metaModelVersion: '2.1.0', aspectModelUrn: 'urn:example:Test#v1'});
      val.parents = new ElementSet(char1, char2);

      const resolution = service.resolveValueType(val);
      expect(resolution.source).toBe('conflict');
      expect(resolution.hasConflict).toBe(true);
      expect(resolution.type).toBeNull();
      expect(resolution.conflictMessage).toContain('conflicting data types');
    });

    it('should resolve common type from multiple connected Characteristics with identical data type', () => {
      const intType1 = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#integer', metaModelVersion: '2.1.0'});
      const intType2 = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#integer', metaModelVersion: '2.1.0'});

      const char1 = new DefaultCharacteristic({
        name: 'c1',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#c1',
        dataType: intType1,
      });
      const char2 = new DefaultCharacteristic({
        name: 'c2',
        metaModelVersion: '2.1.0',
        aspectModelUrn: 'urn:example:Test#c2',
        dataType: intType2,
      });

      const val = new DefaultValue({name: 'v1', value: '100', metaModelVersion: '2.1.0', aspectModelUrn: 'urn:example:Test#v1'});
      val.parents = new ElementSet(char1, char2);

      const resolution = service.resolveValueType(val);
      expect(resolution.source).toBe('multiple-parents-compatible');
      expect(resolution.hasConflict).toBe(false);
      expect(resolution.shortType).toBe('integer');
    });
  });
});
