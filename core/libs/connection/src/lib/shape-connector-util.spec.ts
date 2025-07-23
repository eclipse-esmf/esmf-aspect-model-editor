/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEntity,
  DefaultProperty,
  DefaultTrait,
} from '@esmf/aspect-model-loader';
import {describe} from '@jest/globals';
import {
  AspectProps,
  CharacteristicProps,
  CollectionProps,
  ConstraintProps,
  EntityProps,
  PropertyProps,
  TraitProps,
} from '../../../aspect-model-loader/src/lib/shared/props';
import {ShapeConnectorUtil} from './shape-connector-util';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('Test Shape connector util', () => {
  test('should be parent: Entity child: Property', () => {
    const parentModel = new DefaultEntity({aspectModelUrn: 'urn#parent'} as EntityProps);
    const childModel = new DefaultProperty({aspectModelUrn: 'urn#'} as PropertyProps);
    expect(ShapeConnectorUtil.isEntityPropertyConnection(parentModel, childModel)).toBeTruthy();
  });
  test('should be parent: Characteristic child: Entity', () => {
    const parentModel = new DefaultCharacteristic({aspectModelUrn: 'urn#parent'} as CharacteristicProps);
    const childModel = new DefaultEntity({aspectModelUrn: 'urn#child'} as EntityProps);
    expect(ShapeConnectorUtil.isCharacteristicEntityConnection(parentModel, childModel)).toBeTruthy();
  });
  test('should be parent: Property child: Characteristic', () => {
    const parentModel = new DefaultProperty({aspectModelUrn: 'urn#parent'} as PropertyProps);
    const childModel = new DefaultCharacteristic({aspectModelUrn: 'urn#child'} as CharacteristicProps);
    expect(ShapeConnectorUtil.isPropertyCharacteristicConnection(parentModel, childModel)).toBeTruthy();
  });
  test('should be parent: Trait child: Constraint', () => {
    const parentModel = new DefaultTrait({aspectModelUrn: 'urn#parent'} as TraitProps);
    const childModel = new DefaultConstraint({aspectModelUrn: 'urn#child'} as ConstraintProps);
    expect(ShapeConnectorUtil.isTraitConstraintConnection(parentModel, childModel)).toBeTruthy();
  });

  describe('isTraitCharacteristicConnectionValid', () => {
    test('should be parent: Trait child: Characteristic', () => {
      const parentModel = new DefaultTrait({aspectModelUrn: 'urn#parent'} as TraitProps);
      const childModel = new DefaultCharacteristic({aspectModelUrn: 'urn#child'} as CharacteristicProps);
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel)).toBeTruthy();
    });
    test('parent trait has baseCharacteristic', () => {
      const parentModel = new DefaultTrait({aspectModelUrn: 'urn#parent'} as TraitProps);
      const childModel = new DefaultCharacteristic({aspectModelUrn: 'urn#child'} as CharacteristicProps);
      parentModel.baseCharacteristic = {} as DefaultCharacteristic;
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel)).toBeFalsy();
    });
    test('should be parent: Trait child: Trait', () => {
      const parentModel = new DefaultTrait({aspectModelUrn: 'urn#parent'} as TraitProps);
      const childModel = new DefaultTrait({aspectModelUrn: 'urn#child'} as TraitProps);
      expect(ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel)).toBeFalsy();
    });
  });
  test('should be parent: Aspect child: Property', () => {
    const parentModel = new DefaultAspect({aspectModelUrn: 'urn#parent'} as AspectProps);
    const childModel = new DefaultProperty({aspectModelUrn: 'urn#child'} as PropertyProps);
    expect(ShapeConnectorUtil.isAspectPropertyConnection(parentModel, childModel)).toBeTruthy();
  });
  test('should be parent: Characteristic child: Collection', () => {
    const parentModel = new DefaultCharacteristic({aspectModelUrn: 'urn#parent'} as CharacteristicProps);
    const childModel = new DefaultCollection({aspectModelUrn: 'urn#child'} as CollectionProps);
    expect(ShapeConnectorUtil.isCharacteristicCollectionConnection(parentModel, childModel)).toBeTruthy();
  });
  test('should be parent: Collection child: Characteristic', () => {
    const parentModel = new DefaultCollection({aspectModelUrn: 'urn#parent'} as CollectionProps);
    const childModel = new DefaultCharacteristic({aspectModelUrn: 'urn#child'} as CharacteristicProps);
    expect(ShapeConnectorUtil.isCollectionCharacteristicConnection(parentModel, childModel)).toBeTruthy();
  });
});
