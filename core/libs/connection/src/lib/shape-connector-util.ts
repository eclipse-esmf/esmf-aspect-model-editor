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

import {ModelInfo} from '@ame/mx-graph';
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
  NamedElement,
} from '@esmf/aspect-model-loader';

export class ShapeConnectorUtil {
  static isEntityPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultEntity && childModel instanceof DefaultProperty;
  }

  static isEntityEntityConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultEntity && childModel instanceof DefaultEntity;
  }

  static isEntityAbstractEntityConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultEntity && childModel instanceof DefaultEntity && childModel.isAbstractEntity();
  }

  static isAbstractEntityAbstractEntityConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (
      parentModel instanceof DefaultEntity &&
      parentModel.isAbstractEntity() &&
      childModel instanceof DefaultEntity &&
      childModel.isAbstractEntity()
    );
  }

  static isAbstractEntityPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultEntity && parentModel.isAbstractEntity() && childModel instanceof DefaultProperty;
  }

  static isCharacteristicEntityConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultCharacteristic && childModel instanceof DefaultEntity;
  }

  static isPropertyStructuredValueConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultStructuredValue;
  }

  static isPropertyCharacteristicConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultCharacteristic;
  }

  static isPropertyValueConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultValue;
  }

  static isTraitConstraintConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultTrait && childModel instanceof DefaultConstraint;
  }

  static isTraitCharacteristicConnectionValid(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (
      parentModel instanceof DefaultTrait &&
      childModel instanceof DefaultCharacteristic &&
      !(childModel instanceof DefaultTrait) &&
      !(childModel instanceof DefaultEither) &&
      (parentModel.getBaseCharacteristic() === null || parentModel.getBaseCharacteristic() === undefined)
    );
  }

  static isAspectPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultAspect && (childModel instanceof DefaultProperty || childModel instanceof DefaultOperation);
  }

  static isPropertyPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultProperty;
  }

  static isPropertyAbstractPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultProperty && childModel.isAbstract;
  }

  static isAbstractEntityAbstractPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (
      parentModel instanceof DefaultEntity &&
      parentModel.isAbstractEntity() &&
      childModel instanceof DefaultProperty &&
      childModel.isAbstract
    );
  }

  static isAbstractPropertyAbstractPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (
      parentModel instanceof DefaultProperty && parentModel.isAbstract && childModel instanceof DefaultProperty && childModel.isAbstract
    );
  }

  static isAspectEventConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultAspect && childModel instanceof DefaultEvent;
  }

  static isEventPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultEvent && childModel instanceof DefaultProperty;
  }

  static isEitherCharacteristicLeftConnection(parentModel: NamedElement, childModel: NamedElement, modelInfo: ModelInfo): boolean {
    return parentModel instanceof DefaultEither && childModel instanceof DefaultCharacteristic && modelInfo === ModelInfo.IS_EITHER_LEFT;
  }

  static isEitherCharacteristicRightConnection(parentModel: NamedElement, childModel: NamedElement, modelInfo: ModelInfo): boolean {
    return parentModel instanceof DefaultEither && childModel instanceof DefaultCharacteristic && modelInfo === ModelInfo.IS_EITHER_RIGHT;
  }

  static isOperationPropertyInputConnection(parentModel: NamedElement, childModel: NamedElement, modelInfo: ModelInfo): boolean {
    return this.isOperationPropertyConnection(parentModel, childModel) && modelInfo === ModelInfo.IS_OPERATION_INPUT;
  }

  static isOperationPropertyOutputConnection(parentModel: NamedElement, childModel: NamedElement, modelInfo: ModelInfo): boolean {
    return this.isOperationPropertyConnection(parentModel, childModel) && modelInfo === ModelInfo.IS_OPERATION_OUTPUT;
  }

  static isOperationPropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultOperation && childModel instanceof DefaultProperty;
  }

  static isPropertyOperationConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultProperty && childModel instanceof DefaultOperation;
  }

  static isCharacteristicCollectionConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultCharacteristic && childModel instanceof DefaultCollection;
  }

  static isCollectionCharacteristicConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultCollection && childModel instanceof DefaultCharacteristic;
  }

  static isCharacteristicUnitConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (parentModel instanceof DefaultQuantifiable || parentModel instanceof DefaultMeasurement) && childModel instanceof DefaultUnit;
  }

  static isEnumerationEntityValueConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (
      parentModel instanceof DefaultEnumeration &&
      childModel instanceof DefaultEntityInstance &&
      parentModel.dataType?.getUrn() === childModel.type?.getUrn()
    );
  }

  static isEnumerationValueConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return (
      parentModel instanceof DefaultEnumeration && childModel instanceof DefaultValue && !(parentModel.dataType instanceof DefaultEntity)
    );
  }

  static isStructuredValuePropertyConnection(parentModel: NamedElement, childModel: NamedElement): boolean {
    return parentModel instanceof DefaultStructuredValue && childModel instanceof DefaultProperty;
  }
}
