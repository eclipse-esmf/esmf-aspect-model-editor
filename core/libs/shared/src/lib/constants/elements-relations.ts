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

export enum Elements {
  aspect = 'aspect',
  property = 'property',
  abstractProperty = 'abstractProperty',
  operation = 'operation',
  constraint = 'constraint',
  characteristic = 'characteristic',
  entity = 'entity',
  trait = 'trait',
  unit = 'unit',
  event = 'event',
  entityValue = 'entityValue',
  abstractEntity = 'abstractEntity',
}

export const relations = {
  [Elements.aspect]: [Elements.property, Elements.operation, Elements.event],
  [Elements.property]: [Elements.characteristic, Elements.trait, Elements.abstractProperty, Elements.property],
  [Elements.abstractProperty]: [Elements.abstractProperty],
  [Elements.characteristic]: [Elements.entity, Elements.entityValue, Elements.unit],
  [Elements.entity]: [Elements.property, Elements.entity, Elements.abstractEntity],
  [Elements.trait]: [Elements.constraint, Elements.characteristic],
  [Elements.entityValue]: [Elements.entityValue],
  [Elements.event]: [Elements.property],
  [Elements.operation]: [],
  [Elements.constraint]: [],
  [Elements.unit]: [],
  [Elements.abstractEntity]: [Elements.abstractEntity, Elements.property, Elements.abstractProperty],
};
