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
  BaseMetaModelElement,
  DefaultAspect,
  DefaultProperty,
  DefaultOperation,
  DefaultTrait,
  DefaultCharacteristic,
  DefaultEntity,
  DefaultConstraint,
  DefaultUnit,
  DefaultEvent,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultEntityValue,
} from '@ame/meta-model';

export const elementShortcuts = {
  aspect: 'A',
  property: 'P',
  operation: 'O',
  characteristic: 'C',
  entity: 'E',
  constraint: 'C',
  trait: 'T',
  unit: 'U',
  event: 'E',
  abstractEntity: 'AE',
  abstractProperty: 'AP',
  entityValue: 'Ev',
};

export function getElementType(modelElement: BaseMetaModelElement) {
  if (modelElement instanceof DefaultAspect) {
    return 'aspect';
  } else if (modelElement instanceof DefaultProperty) {
    return 'property';
  } else if (modelElement instanceof DefaultOperation) {
    return 'operation';
  } else if (modelElement instanceof DefaultTrait) {
    return 'trait';
  } else if (modelElement instanceof DefaultCharacteristic) {
    return 'characteristic';
  } else if (modelElement instanceof DefaultEntity) {
    return 'entity';
  } else if (modelElement instanceof DefaultConstraint) {
    return 'constraint';
  } else if (modelElement instanceof DefaultUnit) {
    return 'unit';
  } else if (modelElement instanceof DefaultEvent) {
    return 'event';
  } else if (modelElement instanceof DefaultAbstractEntity) {
    return 'abstractEntity';
  } else if (modelElement instanceof DefaultAbstractProperty) {
    return 'abstractProperty';
  } else if (modelElement instanceof DefaultEntityValue) {
    return 'entityValue';
  } else {
    return null;
  }
}
