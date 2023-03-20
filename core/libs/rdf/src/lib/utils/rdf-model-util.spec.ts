/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {describe, expect} from '@jest/globals';
import {RdfModelUtil} from './rdf-model-util';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEnumeration,
  DefaultFixedPointConstraint,
  DefaultLengthConstraint,
  DefaultOperation,
  DefaultProperty,
  DefaultRangeConstraint,
  DefaultState,
  Type,
} from '@ame/meta-model';
import {RdfModel} from './rdf-model';
import {Samm, SammC} from '@ame/vocabulary';
import {NamedNode} from 'n3';

jest.mock('./rdf-model', () => ({
  RdfModel: jest.fn().mockImplementation(() => ({
    get samm() {
      return null;
    },

    get sammC() {
      return null;
    },
  })),
}));
describe('Test RDF Model Util', () => {
  describe('getDataType', () => {
    test('should return Urn', () => {
      jest.fn().mockRestore();
      const expectedUrnResult = 'expectedUrnResult';
      const dataType = {
        getUrn: () => expectedUrnResult,
      } as Type;
      const result = RdfModelUtil.getDataType(dataType);
      expect(result.id).toBe(expectedUrnResult);
    });

    test('should return null', () => {
      const dataType = {
        getUrn: () => null,
      } as Type;

      const result = RdfModelUtil.getDataType(dataType);

      expect(result.id).toBe(null);
    });

    test('should return null because no dataType', () => {
      expect(RdfModelUtil.getDataType(null)).toBe(null);
    });
  });

  describe('resolveAccurateType', () => {
    const expectedElementUrn = 'baseMetaModelElementUrn';
    const rdfModel = new RdfModel(null, null, null);

    test('should return DefaultLengthConstraint urn', () => {
      const metaModelElement = DefaultLengthConstraint.createInstance();
      const samm = {} as Samm;
      const sammC = {
        isMinValueProperty: (value): boolean => !!value,
        isMaxValueProperty: (value): boolean => !!value,
      } as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toBeCalled();
    });

    test('should return DefaultFixedPointConstraint urn', () => {
      const metaModelElement = DefaultFixedPointConstraint.createInstance();
      const samm = {} as Samm;
      const sammC = {
        isScaleValueProperty: (_value): boolean => true,
        isIntegerValueProperty: (_value): boolean => true,
      } as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toBeCalled();
    });

    test('should return DefaultProperty urn', () => {
      const metaModelElement = DefaultProperty.createInstance();
      const samm = {
        isExampleValueProperty: (_value): boolean => true,
      } as Samm;
      const sammC = {} as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toBeCalled();
    });

    test('should return DefaultRangeConstraint urn', () => {
      const metaModelElement = DefaultRangeConstraint.createInstance();
      const samm = {} as Samm;
      const sammC = {
        isMinValueProperty: (value): boolean => !!value,
        isMaxValueProperty: (value): boolean => !!value,
      } as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toBeCalled();
    });

    test('should return DefaultEnumeration urn', () => {
      const metaModelElement = DefaultEnumeration.createInstance();
      const samm = {} as Samm;
      const sammC = {
        isValuesProperty: (_value): boolean => true,
      } as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toBeCalled();
    });

    test('should return DefaultState urn', () => {
      const metaModelElement = DefaultState.createInstance();
      const samm = {} as Samm;
      const sammC = {
        isValuesProperty: (_value): boolean => false,
        isDefaultValueProperty: (_value): boolean => true,
      } as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toBeCalled();
    });

    test('should return NULL', () => {
      const metaModelElement = DefaultState.createInstance();
      const samm = {} as Samm;
      const sammC = {
        isValuesProperty: (_value): boolean => false,
        isDefaultValueProperty: (_value): boolean => false,
      } as SammC;

      rdfModel.SAMM = () => samm;
      rdfModel.SAMMC = () => sammC;

      RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(null);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(null);
      expect(RdfModelUtil.getDataType).toBeCalledTimes(0);
    });
  });

  describe('resolvePredicate', () => {
    const rdfModel = new RdfModel(null, null, null);
    test('should return properties property', () => {
      const parent = Object.create(DefaultAspect.prototype);
      const child = Object.create(DefaultProperty.prototype);
      const propertiesProperty = {
        id: 'propertiesPropertyNode',
      } as NamedNode;
      const samm = {
        PropertiesProperty: (): NamedNode => propertiesProperty,
      } as Samm;

      rdfModel.SAMM = () => samm;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(propertiesProperty);
    });

    test('should return operations property', () => {
      const parent = Object.create(DefaultAspect.prototype);
      const child = Object.create(DefaultOperation.prototype);
      const operationsProperty = {
        id: 'operationsPropertyNode',
      } as NamedNode;
      const samm = {
        OperationsProperty: (): NamedNode => operationsProperty,
      } as Samm;

      rdfModel.SAMM = () => samm;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(operationsProperty);
    });

    test('should return characteristic property', () => {
      const parent = Object.create(DefaultProperty.prototype);
      const child = Object.create(DefaultCharacteristic.prototype);
      const characteristicProperty = {
        id: 'characteristicPropertyNode',
      } as NamedNode;
      const samm = {
        CharacteristicProperty: (): NamedNode => characteristicProperty,
      } as Samm;

      rdfModel.SAMM = () => samm;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(characteristicProperty);
    });

    test('should return type property', () => {
      const parent = Object.create(DefaultCharacteristic.prototype);
      const child = Object.create(DefaultEntity.prototype);
      const dataTypeProperty = {
        id: 'dataTypePropertyNode',
      } as NamedNode;
      const samm = {
        DataTypeProperty: (): NamedNode => dataTypeProperty,
      } as Samm;

      rdfModel.SAMM = () => samm;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(dataTypeProperty);
    });

    test('should return properties property', () => {
      const parent = Object.create(DefaultEntity.prototype);
      const child = Object.create(DefaultProperty.prototype);
      const propertiesProperty = {
        id: 'propertiesPropertyNode',
      } as NamedNode;
      const samm = {
        PropertiesProperty: (): NamedNode => propertiesProperty,
      } as Samm;

      rdfModel.SAMM = () => samm;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(propertiesProperty);
    });

    test('should return right property', () => {
      const parent = Object.create(DefaultEither.prototype);
      const rightPropertyUrn = 'rightPropertyUrn';
      parent.right = {aspectModelUrn: rightPropertyUrn};

      const child = Object.create(DefaultCharacteristic.prototype);
      child.aspectModelUrn = rightPropertyUrn;

      const rightProperty = {
        id: 'rightPropertyNode',
      } as NamedNode;
      const sammC = {
        EitherRightProperty: (): NamedNode => rightProperty,
      } as SammC;

      rdfModel.SAMMC = () => sammC;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(rightProperty);
    });

    test('should return left property', () => {
      const parent = Object.create(DefaultEither.prototype);
      const leftPropertyUrn = 'leftPropertyUrn';
      parent.left = {aspectModelUrn: leftPropertyUrn};
      parent.right = null;

      const child = Object.create(DefaultCharacteristic.prototype);
      child.aspectModelUrn = leftPropertyUrn;

      const leftProperty = {
        id: 'leftPropertyNode',
      } as NamedNode;
      const sammC = {
        EitherLeftProperty: (): NamedNode => leftProperty,
      } as SammC;

      rdfModel.SAMMC = () => sammC;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(leftProperty);
    });

    test('should return NULL', () => {
      const parent = Object.create(DefaultEither.prototype);
      const propertyUrn = 'propertyUrn';
      parent.right = null;
      parent.left = null;

      const child = Object.create(DefaultCharacteristic.prototype);
      child.aspectModelUrn = propertyUrn;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(null);
    });
  });
});
