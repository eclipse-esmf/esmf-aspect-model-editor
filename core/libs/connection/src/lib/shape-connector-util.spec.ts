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
import {DefaultEntity} from '../aspect-meta-model/default-entity';
import {DefaultProperty} from '../aspect-meta-model/default-property';
import {ShapeConnectorUtil} from './shape-connector-util';
import {DefaultCharacteristic} from '../aspect-meta-model/default-characteristic';
import {DefaultTrait} from '../aspect-meta-model/default-trait';
import {DefaultConstraint} from '../aspect-meta-model/default-constraint';
import {DefaultAspect} from '../aspect-meta-model/default-aspect';
import {DefaultCollection} from '../aspect-meta-model/default-collection';

describe('Test Shape connector util', () => {
  test('should be parent: Entity child: Property', () => {
    const parentModel = DefaultEntity.createInstance();
    const childModel = DefaultProperty.createInstance();

    expect(ShapeConnectorUtil.isEntityPropertyConnection(parentModel, childModel)).toBeTruthy();
  });

  test('should be parent: Characteristic child: Entity', () => {
    const parentModel = DefaultCharacteristic.createInstance();
    const childModel = DefaultEntity.createInstance();

    expect(ShapeConnectorUtil.isCharacteristicEntityConnection(parentModel, childModel)).toBeTruthy();
  });

  test('should be parent: Property child: Characteristic', () => {
    const parentModel = DefaultProperty.createInstance();
    const childModel = DefaultCharacteristic.createInstance();

    expect(ShapeConnectorUtil.isPropertyCharacteristicConnection(parentModel, childModel)).toBeTruthy();
  });

  test('should be parent: Trait child: Constraint', () => {
    const parentModel = DefaultTrait.createInstance();
    const childModel = DefaultConstraint.createInstance();

    expect(ShapeConnectorUtil.isTraitConstraintConnection(parentModel, childModel)).toBeTruthy();
  });

  describe('isTraitCharacteristicConnectionValid', () => {
    test('should be parent: Trait child: Characteristic', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultCharacteristic.createInstance();

      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel)).toBeTruthy();
    });

    test('parent trait has baseCharacteristic', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultCharacteristic.createInstance();
      parentModel.baseCharacteristic = {} as DefaultCharacteristic;

      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel)).toBeFalsy();
    });

    test('should be parent: Trait child: Trait', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultTrait.createInstance();

      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel)).toBeFalsy();
    });
  });

  test('should be parent: Aspect child: Property', () => {
    const parentModel = new DefaultAspect(null, null, null);
    const childModel = DefaultProperty.createInstance();

    expect(ShapeConnectorUtil.isAspectPropertyConnection(parentModel, childModel)).toBeTruthy();
  });
  test('should be parent: Characteristic child: Collection', () => {
    const parentModel = DefaultCharacteristic.createInstance();
    const childModel = DefaultCollection.createInstance();

    expect(ShapeConnectorUtil.isCharacteristicCollectionConnection(parentModel, childModel)).toBeTruthy();
  });

  test('should be parent: Collection child: Characteristic', () => {
    const parentModel = DefaultCollection.createInstance();
    const childModel = DefaultCharacteristic.createInstance();

    expect(ShapeConnectorUtil.isCollectionCharacteristicConnection(parentModel, childModel)).toBeTruthy();
  });
});
