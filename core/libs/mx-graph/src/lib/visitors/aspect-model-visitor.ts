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
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantityKind,
  DefaultUnit,
} from '@ame/meta-model';

export interface AspectModelVisitor<T, U> {
  visit(metalModelElement: BaseMetaModelElement, context: U): T;

  visitProperty(property: DefaultProperty, context: U): T;

  visitAbstractProperty(property: DefaultAbstractProperty, context: U): T;

  visitAspect(aspect: DefaultAspect, context: U): T;

  visitEvent(property: DefaultEvent, context: U): T;

  visitOperation(operation: DefaultOperation, context: U): T;

  visitConstraint(constraint: DefaultConstraint, context: U): T;

  visitCharacteristic(characteristic: DefaultCharacteristic, context: U): T;

  visitUnit(unit: DefaultUnit, context: U): T;

  visitQuantityKind(quantityKind: DefaultQuantityKind, context: U): T;

  visitEntity(entity: DefaultEntity, context: U): T;

  visitAbstractEntity(abstractEntity: DefaultAbstractEntity, context: U);

  visitEntityValue(entityValue: DefaultEntityValue, context: U): T;
}
