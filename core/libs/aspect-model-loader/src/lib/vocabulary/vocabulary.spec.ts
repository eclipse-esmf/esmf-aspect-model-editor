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
import {Samm, SammC, SammE, SammU} from './index';

describe('SAMM Vocabularies', () => {
  describe('Samm', () => {
    it('should create SAMM vocabulary with version 2.0.0', () => {
      const samm = new Samm('2.0.0');
      expect(samm.version).toBe('2.0.0');
      expect(samm.getNamespace()).toContain('2.0.0');
      expect(samm.getAlias()).toBe('samm');
    });

    it('should generate RDF NamedNodes correctly', () => {
      const samm = new Samm('2.0.0');
      expect(samm.Aspect().value).toBe(`${samm.getNamespace()}Aspect`);
      expect(samm.Property().value).toBe(`${samm.getNamespace()}Property`);
      expect(samm.Characteristic().value).toBe(`${samm.getNamespace()}Characteristic`);
      expect(samm.Entity().value).toBe(`${samm.getNamespace()}Entity`);
    });

    it('should correctly identify predicate properties', () => {
      const samm = new Samm('2.0.0');
      expect(samm.isPreferredNameProperty(samm.PreferredNameProperty().value)).toBe(true);
      expect(samm.isDescriptionProperty(samm.DescriptionProperty().value)).toBe(true);
      expect(samm.isSeeProperty(samm.SeeProperty().value)).toBe(true);
      expect(samm.isCharacteristicProperty(samm.CharacteristicProperty().value)).toBe(true);
    });
  });

  describe('SammC', () => {
    it('should create SammC characteristic vocabulary', () => {
      const samm = new Samm('2.0.0');
      const sammC = new SammC(samm);
      expect(sammC.getAlias()).toBe('samm-c');
      expect(sammC.getNamespace()).toContain('2.0.0');
    });

    it('should generate characteristic NamedNodes', () => {
      const samm = new Samm('2.0.0');
      const sammC = new SammC(samm);
      expect(sammC.TraitCharacteristic().value).toBe(`${sammC.getNamespace()}Trait`);
      expect(sammC.ListCharacteristic().value).toBe(`${sammC.getNamespace()}List`);
      expect(sammC.SetCharacteristic().value).toBe(`${sammC.getNamespace()}Set`);
      expect(sammC.QuantifiableCharacteristic().value).toBe(`${sammC.getNamespace()}Quantifiable`);
      expect(sammC.MeasurementCharacteristic().value).toBe(`${sammC.getNamespace()}Measurement`);
    });
  });

  describe('SammE', () => {
    it('should create SammE entity vocabulary', () => {
      const samm = new Samm('2.0.0');
      const sammE = new SammE(samm);
      expect(sammE.getAlias()).toBe('samm-e');
      expect(sammE.getNamespace()).toContain('2.0.0');
    });
  });

  describe('SammU', () => {
    it('should create SammU unit vocabulary', () => {
      const samm = new Samm('2.0.0');
      const sammU = new SammU(samm);
      expect(sammU.getAlias()).toBe('unit');
      expect(sammU.getNamespace()).toContain('unit');
    });
  });
});
