/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {
  BaseMetaModelElement,
  DefaultProperty,
  DefaultAspect,
  DefaultOperation,
  DefaultConstraint,
  DefaultCharacteristic,
  DefaultUnit,
  DefaultQuantityKind,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent
} from '@bame/meta-model';

export interface AspectModelVisitor<T, U> {
  visit(metalModelElement: BaseMetaModelElement, context: U): T;

  visitProperty(property: DefaultProperty, context: U): T;

  visitAspect(aspect: DefaultAspect, context: U): T;

  visitEvent(property: DefaultEvent, context: U): T;

  visitOperation(operation: DefaultOperation, context: U): T;

  visitConstraint(constraint: DefaultConstraint, context: U): T;

  visitCharacteristic(characteristic: DefaultCharacteristic, context: U): T;

  visitUnit(unit: DefaultUnit, context: U): T;

  visitQuantityKind(quantityKind: DefaultQuantityKind, context: U): T;

  visitEntity(entity: DefaultEntity, context: U): T;

  visitEntityValue(entityValue: DefaultEntityValue, context: U): T;
}
