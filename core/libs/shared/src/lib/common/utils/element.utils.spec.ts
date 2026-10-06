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
import {createTestAspect, createTestCharacteristic, createTestProperty, createTestScalar, createTestTrait} from '../../testing';
import {
  ElementPropertyUtil,
  extractNamespace,
  getDeepLookupDataType,
  getDescriptionsLocales,
  getPreferredNamesLocales,
} from './element.utils';

describe('element.utils', () => {
  describe('ElementPropertyUtil.isOptionalProperty', () => {
    it('should return true for optional property', () => {
      const aspect = createTestAspect();
      const prop = createTestProperty('prop1', 'urn:test#prop1');
      aspect.propertiesPayload = {
        [prop.aspectModelUrn]: {optional: true} as any,
      };
      expect(ElementPropertyUtil.isOptionalProperty(prop, aspect)).toBe(true);
    });

    it('should return false for non-optional property', () => {
      const aspect = createTestAspect();
      const prop = createTestProperty('prop1', 'urn:test#prop1');
      aspect.propertiesPayload = {
        [prop.aspectModelUrn]: {optional: false} as any,
      };
      expect(ElementPropertyUtil.isOptionalProperty(prop, aspect)).toBe(false);
    });
  });

  describe('extractNamespace', () => {
    it('should return namespace from URN with hash', () => {
      expect(extractNamespace('urn:samm:org.example:1.0.0#MyAspect')).toBe('urn:samm:org.example:1.0.0');
    });

    it('should return entire URN if no hash is present', () => {
      expect(extractNamespace('urn:samm:org.example:1.0.0')).toBe('urn:samm:org.example:1.0.0');
    });
  });

  describe('getDeepLookupDataType', () => {
    it('should return dataType from normal characteristic', () => {
      const char = createTestCharacteristic();
      const scalar = createTestScalar();
      char.dataType = scalar;
      expect(getDeepLookupDataType(char)).toBe(scalar);
    });

    it('should return baseCharacteristic dataType from trait', () => {
      const trait = createTestTrait();
      const baseChar = createTestCharacteristic();
      const scalar = createTestScalar();
      baseChar.dataType = scalar;
      trait.baseCharacteristic = baseChar;
      expect(getDeepLookupDataType(trait)).toBe(scalar);
    });
  });

  describe('locales helpers', () => {
    it('should return preferredNames locales', () => {
      const aspect = createTestAspect();
      aspect.preferredNames.set('en', 'Test');
      aspect.preferredNames.set('de', 'Prüfung');
      expect(getPreferredNamesLocales(aspect)).toEqual(['en', 'de']);
    });

    it('should return descriptions locales', () => {
      const aspect = createTestAspect();
      aspect.descriptions.set('en', 'Description');
      aspect.descriptions.set('de', 'Beschreibung');
      expect(getDescriptionsLocales(aspect)).toEqual(['en', 'de']);
    });
  });
});
