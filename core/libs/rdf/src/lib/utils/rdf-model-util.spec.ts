/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {expect, describe} from '@jest/globals';
import {RdfModelUtil} from './rdf-model-util';
import {Type} from '@ame/meta-model';

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

  // describe('resolveAccurateType', () => {
  //   const expectedElementUrn = 'baseMetaModelElementUrn';
  //   const rdfModel = {} as RdfModel;

  //   test('should return DefaultLengthConstraint urn', () => {
  //     const metaModelElement = DefaultLengthConstraint.createInstance();
  //     const bammc = {
  //       isMinValueProperty: (value): boolean => true,
  //       isMaxValueProperty: (value): boolean => true,
  //     } as Bammc;
  //     rdfModel.BAMMC = () => bammc;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(expectedElementUrn);
  //     expect(RdfModelUtil.getDataType).toBeCalled();
  //   });

  //   test('should return DefaultFixedPointConstraint urn', () => {
  //     const metaModelElement = DefaultFixedPointConstraint.createInstance();
  //     const bammc = {
  //       isScaleValueProperty: (value): boolean => true,
  //       isIntegerValueProperty: (value): boolean => true,
  //     } as Bammc;
  //     rdfModel.BAMMC = () => bammc;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(expectedElementUrn);
  //     expect(RdfModelUtil.getDataType).toBeCalled();
  //   });

  //   test('should return DefaultProperty urn', () => {
  //     const metaModelElement = DefaultProperty.createInstance();

  //     const bamm = {
  //       isExampleValueProperty: (value): boolean => true,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(expectedElementUrn);
  //     expect(RdfModelUtil.getDataType).toBeCalled();
  //   });

  //   test('should return DefaultRangeConstraint urn', () => {
  //     const metaModelElement = DefaultRangeConstraint.createInstance();

  //     const bammc = {
  //       isMinValueProperty: (value): boolean => true,
  //       isMaxValueProperty: (value): boolean => true,
  //     } as Bammc;
  //     rdfModel.BAMMC = () => bammc;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(expectedElementUrn);
  //     expect(RdfModelUtil.getDataType).toBeCalled();
  //   });

  //   test('should return DefaultEnumeration urn', () => {
  //     const metaModelElement = DefaultEnumeration.createInstance();
  //     const bammc = {
  //       isValuesProperty: (value): boolean => true,
  //     } as Bammc;
  //     rdfModel.BAMMC = () => bammc;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(expectedElementUrn);
  //     expect(RdfModelUtil.getDataType).toBeCalled();
  //   });

  //   test('should return DefaultState urn', () => {
  //     const metaModelElement = DefaultState.createInstance();
  //     const bammc = {
  //       isValuesProperty: (value): boolean => false,
  //       isDefaultValueProperty: (value): boolean => true,
  //     } as Bammc;
  //     rdfModel.BAMMC = () => bammc;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(expectedElementUrn);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(expectedElementUrn);
  //     expect(RdfModelUtil.getDataType).toBeCalled();
  //   });

  //   test('should return NULL', () => {
  //     const metaModelElement = DefaultState.createInstance();
  //     const bammc = {
  //       isValuesProperty: (value): boolean => false,
  //       isDefaultValueProperty: (value): boolean => false,
  //     } as Bammc;
  //     rdfModel.BAMMC = () => bammc;

  //     RdfModelUtil.getDataType = jest.fn().mockReturnValueOnce(null);

  //     expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel)).toBe(null);
  //     expect(RdfModelUtil.getDataType).toBeCalledTimes(0);
  //   });
  // });

  // describe('resolvePredicate', () => {
  //   const rdfModel = {} as RdfModel;
  //   test('should return properties property', () => {
  //     const parent = Object.create(DefaultAspect.prototype);
  //     const child = Object.create(DefaultProperty.prototype);
  //     const propertiesProperty = {
  //       id: 'propertiesPropertyNode',
  //     } as NamedNode;
  //     const bamm = {
  //       PropertiesProperty: (): NamedNode => propertiesProperty,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(propertiesProperty);
  //   });

  //   test('should return operations property', () => {
  //     const parent = Object.create(DefaultAspect.prototype);
  //     const child = Object.create(DefaultOperation.prototype);
  //     const operationsProperty = {
  //       id: 'operationsPropertyNode',
  //     } as NamedNode;
  //     const bamm = {
  //       OperationsProperty: (): NamedNode => operationsProperty,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(operationsProperty);
  //   });

  //   test('should return base characteristic property', () => {
  //     const parent = Object.create(DefaultConstraint.prototype);
  //     const child = Object.create(DefaultCharacteristic.prototype);
  //     const baseCharacteristicProperty = {
  //       id: 'baseCharacteristicPropertyNode',
  //     } as NamedNode;
  //     const bamm = {
  //       BaseCharacteristicProperty: (): NamedNode => baseCharacteristicProperty,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(baseCharacteristicProperty);
  //   });

  //   test('should return characteristic property', () => {
  //     const parent = Object.create(DefaultProperty.prototype);
  //     const child = Object.create(DefaultCharacteristic.prototype);
  //     const characteristicProperty = {
  //       id: 'characteristicPropertyNode',
  //     } as NamedNode;
  //     const bamm = {
  //       CharacteristicProperty: (): NamedNode => characteristicProperty,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(characteristicProperty);
  //   });

  //   test('should return type property', () => {
  //     const parent = Object.create(DefaultCharacteristic.prototype);
  //     const child = Object.create(DefaultEntity.prototype);
  //     const dataTypeProperty = {
  //       id: 'dataTypePropertyNode',
  //     } as NamedNode;
  //     const bamm = {
  //       DataTypeProperty: (): NamedNode => dataTypeProperty,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(dataTypeProperty);
  //   });

  //   test('should return properties property', () => {
  //     const parent = Object.create(DefaultEntity.prototype);
  //     const child = Object.create(DefaultProperty.prototype);
  //     const propertiesProperty = {
  //       id: 'propertiesPropertyNode',
  //     } as NamedNode;
  //     const bamm = {
  //       PropertiesProperty: (): NamedNode => propertiesProperty,
  //     } as Bamm;
  //     rdfModel.BAMM = () => bamm;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(propertiesProperty);
  //   });

  //   test('should return right property', () => {
  //     const parent = Object.create(DefaultEither.prototype);
  //     const rightPropertyUrn = 'rightPropertyUrn';
  //     parent.right = {aspectModelUrn: rightPropertyUrn};

  //     const child = Object.create(DefaultCharacteristic.prototype);
  //     child.aspectModelUrn = rightPropertyUrn;

  //     const rightProperty = {
  //       id: 'rightPropertyNode',
  //     } as NamedNode;
  //     const bammc = {
  //       EitherRightProperty: (): NamedNode => rightProperty,
  //     } as Bammc;

  //     rdfModel.BAMMC = () => bammc;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(rightProperty);
  //   });

  //   test('should return left property', () => {
  //     const parent = Object.create(DefaultEither.prototype);
  //     const leftPropertyUrn = 'leftPropertyUrn';
  //     parent.left = {aspectModelUrn: leftPropertyUrn};
  //     parent.right = null;

  //     const child = Object.create(DefaultCharacteristic.prototype);
  //     child.aspectModelUrn = leftPropertyUrn;

  //     const leftProperty = {
  //       id: 'leftPropertyNode',
  //     } as NamedNode;
  //     const bammc = {
  //       EitherLeftProperty: (): NamedNode => leftProperty,
  //     } as Bammc;

  //     rdfModel.BAMMC = () => bammc;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(leftProperty);
  //   });

  //   test('should return NULL', () => {
  //     const parent = Object.create(DefaultEither.prototype);
  //     const propertyUrn = 'propertyUrn';
  //     parent.right = null;
  //     parent.left = null;

  //     const child = Object.create(DefaultCharacteristic.prototype);
  //     child.aspectModelUrn = propertyUrn;

  //     expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toBe(null);
  //   });
  // });
});
