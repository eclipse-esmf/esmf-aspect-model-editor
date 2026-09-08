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
  createTestAspect as createAspect,
  createTestCharacteristic as createChar,
  createTestCollection as createCollection,
  createTestConstraint as createConstraint,
  createTestEither as createEither,
  createTestEntity as createEntity,
  createTestEnumeration as createEnumeration,
  createTestEvent as createEvent,
  createTestOperation as createOperation,
  createTestProperty as createProp,
  createTestQuantifiable as createQuantifiable,
  createTestScalar as createScalar,
  createTestStructuredValue as createStructuredValue,
  createTestTrait as createTrait,
  createTestUnit as createUnit,
  createTestValue as createValue,
} from '@ame/test-helpers';
import {describe, expect, it} from 'vitest';
import {useUpdater} from './element-updater';

describe('element-updater', () => {
  describe('DefaultCharacteristic', () => {
    it('should update and delete dataType for characteristic', () => {
      const char = createChar();
      char.isPredefined = false;
      const updater = useUpdater(char);
      const scalar = createScalar();

      updater.update(scalar);
      expect(char.dataType).toBe(scalar);

      updater.delete(scalar);
      expect(char.dataType).toBeNull();
    });
  });

  describe('DefaultEntity', () => {
    it('should remove property and extends from entity', () => {
      const entity = createEntity();
      const prop = createProp('prop1', 'urn:prop1');
      entity.properties = [prop];

      const parentEntity = createEntity('parent', 'urn:parent');
      entity.extends_ = parentEntity;

      const updater = useUpdater(entity);

      updater.delete(prop);
      expect(entity.properties.length).toBe(0);

      updater.delete(parentEntity);
      expect(entity.extends_).toBeNull();
    });

    it('should remove property and abstract extends from abstract entity', () => {
      const absEntity = createEntity('absEntity', 'urn:abs', true);
      const prop = createProp('prop1', 'urn:prop1');
      absEntity.properties = [prop];

      const parentEntity = createEntity('parent', 'urn:parent', true);
      absEntity.extends_ = parentEntity;

      const updater = useUpdater(absEntity);

      updater.delete(prop);
      expect(absEntity.properties.length).toBe(0);

      updater.delete(parentEntity);
      expect(absEntity.extends_).toBeNull();
    });
  });

  describe('DefaultAspect', () => {
    it('should delete property, operation, and event from aspect', () => {
      const aspect = createAspect();
      const prop = createProp('prop1', 'urn:prop1');
      const op = createOperation();
      const event = createEvent();

      aspect.properties = [prop];
      aspect.operations = [op];
      aspect.events = [event];

      const updater = useUpdater(aspect);

      updater.delete(prop);
      expect(aspect.properties.length).toBe(0);

      updater.delete(op);
      expect(aspect.operations.length).toBe(0);

      updater.delete(event);
      expect(aspect.events.length).toBe(0);
    });
  });

  describe('DefaultCollection', () => {
    it('should update and delete elementCharacteristic and dataType', () => {
      const col = createCollection();
      const elementChar = createChar('elemChar', 'urn:elemChar');
      const scalar = createScalar();

      const updater = useUpdater(col);

      updater.update(elementChar);
      expect(col.elementCharacteristic).toBe(elementChar);

      updater.update(scalar);
      expect(col.dataType).toBe(scalar);

      updater.delete(elementChar);
      expect(col.elementCharacteristic).toBeNull();

      updater.delete(scalar);
      expect(col.dataType).toBeNull();
    });
  });

  describe('DefaultEither', () => {
    it('should delete left or right branch', () => {
      const leftChar = createChar('left', 'urn:left');
      const rightChar = createChar('right', 'urn:right');
      const either = createEither('Either', 'urn:either', leftChar, rightChar);

      const updater = useUpdater(either);

      updater.delete(leftChar);
      expect(either.left).toBeNull();
      expect(either.right).toBe(rightChar);

      updater.delete(rightChar);
      expect(either.right).toBeNull();
    });
  });

  describe('DefaultEnumeration', () => {
    it('should delete entity dataType or values', () => {
      const enumeration = createEnumeration();
      const entity = createEntity();
      const val1 = createValue('val1', 'urn:val1');
      const val2 = createValue('val2', 'urn:val2');

      enumeration.dataType = entity;
      enumeration.values = [val1, val2];

      const updater = useUpdater(enumeration);

      updater.delete(val1);
      expect(enumeration.values).toEqual([val2]);

      updater.delete(entity);
      expect(enumeration.dataType).toBeNull();
      expect(enumeration.values).toEqual([]);
    });
  });

  describe('DefaultEvent & DefaultOperation', () => {
    it('should delete property from event', () => {
      const event = createEvent();
      const prop = createProp();
      event.properties = [prop];

      const updater = useUpdater(event);
      updater.delete(prop);
      expect(event.properties.length).toBe(0);
    });

    it('should delete input property and output from operation', () => {
      const op = createOperation();
      const inProp = createProp('in', 'urn:in');
      const outProp = createProp('out', 'urn:out');

      op.input = [inProp];
      op.output = outProp;

      const updater = useUpdater(op);
      updater.delete(inProp);
      expect(op.input.length).toBe(0);

      updater.delete(outProp);
      expect(op.output).toBeNull();
    });
  });

  describe('DefaultProperty', () => {
    it('should update characteristic and scalar dataType', () => {
      const prop = createProp();
      const char = createChar();
      const scalar = createScalar();

      const updater = useUpdater(prop);
      updater.update(char);
      expect(prop.characteristic).toBe(char);

      updater.update(scalar);
      expect(prop.characteristic.dataType).toBe(scalar);

      const val = createValue();
      prop.exampleValue = val;
      updater.delete(val);
      expect(prop.exampleValue).toBeNull();

      updater.delete(char);
      expect(prop.characteristic).toBeNull();
    });
  });

  describe('DefaultQuantifiable', () => {
    it('should update and delete unit and dataType', () => {
      const quantifiable = createQuantifiable();
      const unit = createUnit();
      const scalar = createScalar();

      const updater = useUpdater(quantifiable);
      updater.update(unit);
      expect(quantifiable.unit).toBe(unit);

      updater.update(scalar);
      expect(quantifiable.dataType).toBe(scalar);

      updater.delete(unit);
      expect(quantifiable.unit).toBeNull();
    });
  });

  describe('DefaultStructuredValue', () => {
    it('should remove elements', () => {
      const sv = createStructuredValue();
      const prop1 = createProp('p1', 'urn:p1');
      const prop2 = createProp('p2', 'urn:p2');

      sv.elements = [prop1, prop2, 'delimiter' as any];

      const updater = useUpdater(sv);
      updater.delete(prop1);
      expect(sv.elements).toEqual([prop2, 'delimiter']);
    });
  });

  describe('DefaultTrait', () => {
    it('should update and delete baseCharacteristic and constraints', () => {
      const trait = createTrait();
      const char = createChar('baseChar', 'urn:baseChar');
      const constraint = createConstraint();

      trait.constraints = [];

      const updater = useUpdater(trait);
      updater.update(char);
      expect(trait.baseCharacteristic).toBe(char);

      updater.update(constraint);
      expect(trait.constraints).toContain(constraint);

      updater.delete(constraint);
      expect(trait.constraints).not.toContain(constraint);

      updater.delete(char);
      expect(trait.baseCharacteristic).toBeNull();
    });
  });

  describe('fallback', () => {
    it('should provide no-op updater for unhandled types', () => {
      const updater = useUpdater({} as any);
      expect(typeof updater.update).toBe('function');
      expect(typeof updater.delete).toBe('function');
      expect(() => updater.update(createProp())).not.toThrow();
      expect(() => updater.delete(createProp())).not.toThrow();
    });
  });
});
