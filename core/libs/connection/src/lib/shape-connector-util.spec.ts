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

import {describe, expect, test, vi} from 'vitest';

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {ModelInfo} from '@ame/max-graph';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultEvent,
  DefaultMeasurement,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
} from '@esmf/aspect-model-loader';
import {ShapeConnectorUtil} from './shape-connector-util';

describe('Test Shape connector util', () => {
  test('should detect Entity -> Property connection', () => {
    const parent = new DefaultEntity({aspectModelUrn: 'urn#entity', name: 'entity', metaModelVersion: '2.0.0'});
    const child = new DefaultProperty({aspectModelUrn: 'urn#property', name: 'property', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isEntityPropertyConnection(parent, child)).toBe(true);
    expect(ShapeConnectorUtil.isEntityPropertyConnection(child, parent)).toBe(false);
  });

  test('should detect Entity -> Entity connection', () => {
    const parent = new DefaultEntity({aspectModelUrn: 'urn#parentEntity', name: 'parentEntity', metaModelVersion: '2.0.0'});
    const child = new DefaultEntity({aspectModelUrn: 'urn#childEntity', name: 'childEntity', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isEntityEntityConnection(parent, child)).toBe(true);
    const prop = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isEntityEntityConnection(parent, prop)).toBe(false);
  });

  test('should detect Entity -> AbstractEntity connection', () => {
    const parent = new DefaultEntity({aspectModelUrn: 'urn#parent', name: 'parent', metaModelVersion: '2.0.0'});
    const child = new DefaultEntity({aspectModelUrn: 'urn#child', name: 'child', metaModelVersion: '2.0.0'});
    vi.spyOn(child, 'isAbstractEntity').mockReturnValue(true);
    expect(ShapeConnectorUtil.isEntityAbstractEntityConnection(parent, child)).toBe(true);

    vi.spyOn(child, 'isAbstractEntity').mockReturnValue(false);
    expect(ShapeConnectorUtil.isEntityAbstractEntityConnection(parent, child)).toBe(false);
  });

  test('should detect AbstractEntity -> AbstractEntity connection', () => {
    const parent = new DefaultEntity({aspectModelUrn: 'urn#parent', name: 'parent', metaModelVersion: '2.0.0'});
    const child = new DefaultEntity({aspectModelUrn: 'urn#child', name: 'child', metaModelVersion: '2.0.0'});
    vi.spyOn(parent, 'isAbstractEntity').mockReturnValue(true);
    vi.spyOn(child, 'isAbstractEntity').mockReturnValue(true);
    expect(ShapeConnectorUtil.isAbstractEntityAbstractEntityConnection(parent, child)).toBe(true);

    vi.spyOn(parent, 'isAbstractEntity').mockReturnValue(false);
    expect(ShapeConnectorUtil.isAbstractEntityAbstractEntityConnection(parent, child)).toBe(false);
  });

  test('should detect AbstractEntity -> Property connection', () => {
    const parent = new DefaultEntity({aspectModelUrn: 'urn#parent', name: 'parent', metaModelVersion: '2.0.0'});
    const child = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    vi.spyOn(parent, 'isAbstractEntity').mockReturnValue(true);
    expect(ShapeConnectorUtil.isAbstractEntityPropertyConnection(parent, child)).toBe(true);

    vi.spyOn(parent, 'isAbstractEntity').mockReturnValue(false);
    expect(ShapeConnectorUtil.isAbstractEntityPropertyConnection(parent, child)).toBe(false);
  });

  test('should detect Characteristic -> Entity connection', () => {
    const parent = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});
    const child = new DefaultEntity({aspectModelUrn: 'urn#entity', name: 'entity', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isCharacteristicEntityConnection(parent, child)).toBe(true);
    expect(ShapeConnectorUtil.isCharacteristicEntityConnection(child, parent)).toBe(false);
  });

  test('should detect Property -> StructuredValue connection', () => {
    const parent = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const child = new DefaultStructuredValue({
      aspectModelUrn: 'urn#sv',
      name: 'sv',
      metaModelVersion: '2.0.0',
      elements: [],
      deconstructionRule: 'rule',
    });
    expect(ShapeConnectorUtil.isPropertyStructuredValueConnection(parent, child)).toBe(true);
    expect(ShapeConnectorUtil.isPropertyStructuredValueConnection(child, parent)).toBe(false);
  });

  test('should detect Property -> Characteristic connection', () => {
    const parent = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const child = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isPropertyCharacteristicConnection(parent, child)).toBe(true);
    expect(ShapeConnectorUtil.isPropertyCharacteristicConnection(child, parent)).toBe(false);
  });

  test('should detect Property -> Value connection', () => {
    const parent = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const child = new DefaultValue({aspectModelUrn: 'urn#val', name: 'val', metaModelVersion: '2.0.0', value: 'val'});
    expect(ShapeConnectorUtil.isPropertyValueConnection(parent, child)).toBe(true);
    expect(ShapeConnectorUtil.isPropertyValueConnection(child, parent)).toBe(false);
  });

  test('should detect Trait -> Constraint connection', () => {
    const parent = new DefaultTrait({aspectModelUrn: 'urn#trait', name: 'trait', metaModelVersion: '2.0.0'});
    const child = new DefaultConstraint({aspectModelUrn: 'urn#constraint', name: 'constraint', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isTraitConstraintConnection(parent, child)).toBe(true);
    expect(ShapeConnectorUtil.isTraitConstraintConnection(child, parent)).toBe(false);
  });

  describe('isTraitCharacteristicConnectionValid', () => {
    test('valid when parent is Trait with no baseCharacteristic and child is Characteristic', () => {
      const parent = new DefaultTrait({aspectModelUrn: 'urn#trait', name: 'trait', metaModelVersion: '2.0.0'});
      const child = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parent, child)).toBe(true);
    });

    test('invalid when parent trait already has a baseCharacteristic', () => {
      const parent = new DefaultTrait({aspectModelUrn: 'urn#trait', name: 'trait', metaModelVersion: '2.0.0'});
      const child = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});
      parent.baseCharacteristic = {} as DefaultCharacteristic;
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parent, child)).toBe(false);
    });

    test('invalid when child is Trait or Either', () => {
      const parent = new DefaultTrait({aspectModelUrn: 'urn#trait', name: 'trait', metaModelVersion: '2.0.0'});
      const childTrait = new DefaultTrait({aspectModelUrn: 'urn#childTrait', name: 'childTrait', metaModelVersion: '2.0.0'});
      const childEither = new DefaultEither({
        aspectModelUrn: 'urn#childEither',
        name: 'childEither',
        metaModelVersion: '2.0.0',
        left: null as any,
        right: null as any,
      });
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parent, childTrait)).toBe(false);
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parent, childEither)).toBe(false);
    });
  });

  test('should detect Aspect -> Property / Operation connection', () => {
    const aspect = new DefaultAspect({aspectModelUrn: 'urn#aspect', name: 'aspect', metaModelVersion: '2.0.0'});
    const prop = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const op = new DefaultOperation({aspectModelUrn: 'urn#op', name: 'op', metaModelVersion: '2.0.0', input: []});
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});

    expect(ShapeConnectorUtil.isAspectPropertyConnection(aspect, prop)).toBe(true);
    expect(ShapeConnectorUtil.isAspectPropertyConnection(aspect, op)).toBe(true);
    expect(ShapeConnectorUtil.isAspectPropertyConnection(aspect, char)).toBe(false);
  });

  test('should detect Property -> Property connection', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn#prop2', name: 'prop2', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isPropertyPropertyConnection(prop1, prop2)).toBe(true);
  });

  test('should detect Property -> AbstractProperty connection', () => {
    const prop = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const abstractProp = new DefaultProperty({aspectModelUrn: 'urn#abProp', name: 'abProp', metaModelVersion: '2.0.0', isAbstract: true});
    expect(ShapeConnectorUtil.isPropertyAbstractPropertyConnection(prop, abstractProp)).toBe(true);
    expect(ShapeConnectorUtil.isPropertyAbstractPropertyConnection(prop, prop)).toBe(false);
  });

  test('should detect AbstractEntity -> AbstractProperty connection', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn#entity', name: 'entity', metaModelVersion: '2.0.0'});
    const abstractProp = new DefaultProperty({aspectModelUrn: 'urn#abProp', name: 'abProp', metaModelVersion: '2.0.0', isAbstract: true});
    vi.spyOn(entity, 'isAbstractEntity').mockReturnValue(true);
    expect(ShapeConnectorUtil.isAbstractEntityAbstractPropertyConnection(entity, abstractProp)).toBe(true);
  });

  test('should detect AbstractProperty -> AbstractProperty connection', () => {
    const abProp1 = new DefaultProperty({aspectModelUrn: 'urn#p1', name: 'p1', metaModelVersion: '2.0.0', isAbstract: true});
    const abProp2 = new DefaultProperty({aspectModelUrn: 'urn#p2', name: 'p2', metaModelVersion: '2.0.0', isAbstract: true});
    const normalProp = new DefaultProperty({aspectModelUrn: 'urn#p3', name: 'p3', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isAbstractPropertyAbstractPropertyConnection(abProp1, abProp2)).toBe(true);
    expect(ShapeConnectorUtil.isAbstractPropertyAbstractPropertyConnection(abProp1, normalProp)).toBe(false);
  });

  test('should detect Aspect -> Event connection', () => {
    const aspect = new DefaultAspect({aspectModelUrn: 'urn#aspect', name: 'aspect', metaModelVersion: '2.0.0'});
    const event = new DefaultEvent({aspectModelUrn: 'urn#event', name: 'event', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isAspectEventConnection(aspect, event)).toBe(true);
    expect(ShapeConnectorUtil.isAspectEventConnection(event, aspect)).toBe(false);
  });

  test('should detect Event -> Property connection', () => {
    const event = new DefaultEvent({aspectModelUrn: 'urn#event', name: 'event', metaModelVersion: '2.0.0'});
    const prop = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isEventPropertyConnection(event, prop)).toBe(true);
    expect(ShapeConnectorUtil.isEventPropertyConnection(prop, event)).toBe(false);
  });

  test('should detect Either Characteristic Left / Right connections', () => {
    const either = new DefaultEither({
      aspectModelUrn: 'urn#either',
      name: 'either',
      metaModelVersion: '2.0.0',
      left: null as any,
      right: null as any,
    });
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});

    expect(ShapeConnectorUtil.isEitherCharacteristicLeftConnection(either, char, ModelInfo.IS_EITHER_LEFT)).toBe(true);
    expect(ShapeConnectorUtil.isEitherCharacteristicLeftConnection(either, char, ModelInfo.IS_EITHER_RIGHT)).toBe(false);
    expect(ShapeConnectorUtil.isEitherCharacteristicRightConnection(either, char, ModelInfo.IS_EITHER_RIGHT)).toBe(true);
    expect(ShapeConnectorUtil.isEitherCharacteristicRightConnection(either, char, ModelInfo.IS_EITHER_LEFT)).toBe(false);
  });

  test('should detect Operation Property Input / Output connections', () => {
    const op = new DefaultOperation({aspectModelUrn: 'urn#op', name: 'op', metaModelVersion: '2.0.0', input: []});
    const prop = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});

    expect(ShapeConnectorUtil.isOperationPropertyInputConnection(op, prop, ModelInfo.IS_OPERATION_INPUT)).toBe(true);
    expect(ShapeConnectorUtil.isOperationPropertyInputConnection(op, prop, ModelInfo.IS_OPERATION_OUTPUT)).toBe(false);
    expect(ShapeConnectorUtil.isOperationPropertyOutputConnection(op, prop, ModelInfo.IS_OPERATION_OUTPUT)).toBe(true);
    expect(ShapeConnectorUtil.isOperationPropertyOutputConnection(op, prop, ModelInfo.IS_OPERATION_INPUT)).toBe(false);
    expect(ShapeConnectorUtil.isOperationPropertyConnection(op, prop)).toBe(true);
    expect(ShapeConnectorUtil.isPropertyOperationConnection(prop, op)).toBe(true);
  });

  test('should detect Characteristic <-> Collection connections', () => {
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn#char', name: 'char', metaModelVersion: '2.0.0'});
    const coll = new DefaultCollection({aspectModelUrn: 'urn#coll', name: 'coll', metaModelVersion: '2.0.0'});

    expect(ShapeConnectorUtil.isCharacteristicCollectionConnection(char, coll)).toBe(true);
    expect(ShapeConnectorUtil.isCollectionCharacteristicConnection(coll, char)).toBe(true);
  });

  test('should detect Characteristic -> Unit connection for Quantifiable and Measurement', () => {
    const quant = new DefaultQuantifiable({aspectModelUrn: 'urn#q', name: 'q', metaModelVersion: '2.0.0'});
    const meas = new DefaultMeasurement({aspectModelUrn: 'urn#m', name: 'm', metaModelVersion: '2.0.0'});
    const unit = new DefaultUnit({aspectModelUrn: 'urn#u', name: 'u', metaModelVersion: '2.0.0', quantityKinds: []});
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn#c', name: 'c', metaModelVersion: '2.0.0'});

    expect(ShapeConnectorUtil.isCharacteristicUnitConnection(quant, unit)).toBe(true);
    expect(ShapeConnectorUtil.isCharacteristicUnitConnection(meas, unit)).toBe(true);
    expect(ShapeConnectorUtil.isCharacteristicUnitConnection(char, unit)).toBe(false);
  });

  test('should detect Enumeration -> EntityValue connection', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn#entity', name: 'entity', metaModelVersion: '2.0.0'});
    const enumeration = new DefaultEnumeration({
      aspectModelUrn: 'urn#enum',
      name: 'enum',
      metaModelVersion: '2.0.0',
      dataType: entity,
      values: [],
    });
    const entityInstance = new DefaultEntityInstance({
      aspectModelUrn: 'urn#inst',
      name: 'inst',
      metaModelVersion: '2.0.0',
    });
    entityInstance.type = entity;

    expect(ShapeConnectorUtil.isEnumerationEntityValueConnection(enumeration, entityInstance)).toBe(true);
  });

  test('should detect Enumeration -> Value connection', () => {
    const enumeration = new DefaultEnumeration({aspectModelUrn: 'urn#enum', name: 'enum', metaModelVersion: '2.0.0', values: []});
    const value = new DefaultValue({aspectModelUrn: 'urn#val', name: 'val', metaModelVersion: '2.0.0', value: 'val'});
    expect(ShapeConnectorUtil.isEnumerationValueConnection(enumeration, value)).toBe(true);
  });

  test('should detect StructuredValue -> Property connection', () => {
    const sv = new DefaultStructuredValue({
      aspectModelUrn: 'urn#sv',
      name: 'sv',
      metaModelVersion: '2.0.0',
      elements: [],
      deconstructionRule: 'rule',
    });
    const prop = new DefaultProperty({aspectModelUrn: 'urn#prop', name: 'prop', metaModelVersion: '2.0.0'});
    expect(ShapeConnectorUtil.isStructuredValuePropertyConnection(sv, prop)).toBe(true);
  });
});
