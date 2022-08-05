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

import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultEvent,
  DefaultMeasurement,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
} from '@ame/meta-model';
import {ModelInfo} from '@ame/mx-graph';

export class ShapeConnectorUtil {
  static isEntityPropertyConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultEntity && childModel instanceof DefaultProperty;
  }

  static isEntityEntityConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultEntity && childModel instanceof DefaultEntity;
  }

  static isEntityAbstractEntityConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultEntity && childModel instanceof DefaultAbstractEntity;
  }

  static isAbstractEntityAbstractEntityConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultAbstractEntity && childModel instanceof DefaultAbstractEntity;
  }

  static isAbstractEntityPropertyConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultAbstractEntity && childModel instanceof DefaultProperty;
  }

  static isCharacteristicEntityConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultCharacteristic && childModel instanceof DefaultEntity;
  }

  static isPropertyCharacteristicConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultCharacteristic;
  }

  static isTraitConstraintConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultTrait && childModel instanceof DefaultConstraint;
  }

  static isTraitCharacteristicConnectionValid(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return (
      parentModel instanceof DefaultTrait &&
      childModel instanceof DefaultCharacteristic &&
      !(childModel instanceof DefaultTrait) &&
      !(childModel instanceof DefaultEither) &&
      parentModel.getBaseCharacteristic() === null
    );
  }

  static isAspectPropertyConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultAspect && (childModel instanceof DefaultProperty || childModel instanceof DefaultOperation);
  }

  static isAspectEventConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultAspect && childModel instanceof DefaultEvent;
  }

  static isEventPropertyConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultEvent && childModel instanceof DefaultProperty;
  }

  static isEitherCharacteristicLeftConnection(
    parentModel: BaseMetaModelElement,
    childModel: BaseMetaModelElement,
    modelInfo: ModelInfo
  ): boolean {
    return parentModel instanceof DefaultEither && childModel instanceof DefaultCharacteristic && modelInfo === ModelInfo.IS_EITHER_LEFT;
  }

  static isEitherCharacteristicRightConnection(
    parentModel: BaseMetaModelElement,
    childModel: BaseMetaModelElement,
    modelInfo: ModelInfo
  ): boolean {
    return parentModel instanceof DefaultEither && childModel instanceof DefaultCharacteristic && modelInfo === ModelInfo.IS_EITHER_RIGHT;
  }

  static isOperationPropertyInputConnection(
    parentModel: BaseMetaModelElement,
    childModel: BaseMetaModelElement,
    modelInfo: ModelInfo
  ): boolean {
    return this.isOperationPropertyConnection(parentModel, childModel) && modelInfo === ModelInfo.IS_OPERATION_INPUT;
  }

  static isOperationPropertyOutputConnection(
    parentModel: BaseMetaModelElement,
    childModel: BaseMetaModelElement,
    modelInfo: ModelInfo
  ): boolean {
    return this.isOperationPropertyConnection(parentModel, childModel) && modelInfo === ModelInfo.IS_OPERATION_OUTPUT;
  }

  static isOperationPropertyConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultOperation && childModel instanceof DefaultProperty;
  }

  static isPropertyOperationConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultOperation;
  }

  static isCharacteristicCollectionConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultCharacteristic && childModel instanceof DefaultCollection;
  }

  static isCollectionCharacteristicConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultCollection && childModel instanceof DefaultCharacteristic;
  }

  static isCharacteristicUnitConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return (parentModel instanceof DefaultQuantifiable || parentModel instanceof DefaultMeasurement) && childModel instanceof DefaultUnit;
  }

  static isEnumerationEntityValueConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return (
      parentModel instanceof DefaultEnumeration &&
      childModel instanceof DefaultEntityValue &&
      parentModel.dataType?.getUrn() === childModel.entity?.getUrn()
    );
  }

  static isStructuredValuePropertyConnection(parentModel: BaseMetaModelElement, childModel: BaseMetaModelElement): boolean {
    return parentModel instanceof DefaultStructuredValue && childModel instanceof DefaultProperty;
  }
}
