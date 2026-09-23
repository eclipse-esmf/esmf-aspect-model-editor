/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
} from '@esmf/aspect-model-loader';

export type ElementType =
  | 'aspect'
  | 'event'
  | 'operation'
  | 'property'
  | 'abstract-property'
  | 'characteristic'
  | 'entity'
  | 'abstract-entity'
  | 'unit'
  | 'trait'
  | 'constraint'
  | 'entityInstance'
  | 'value';

export type ElementNames =
  | 'Aspect'
  | 'Event'
  | 'Operation'
  | 'Property'
  | 'Abstract Property'
  | 'Characteristic'
  | 'Entity'
  | 'Abstract Entity'
  | 'Constraint'
  | 'Trait'
  | 'Unit'
  | 'Entity Instance'
  | 'Value';

export type ElementSymbols = 'A' | 'Ev' | 'O' | 'P' | 'AP' | 'C' | 'Co' | 'E' | 'AE' | 'T' | 'U' | 'e' | 'V';

export type ElementInfo = {
  [K in ElementType]: {
    name: ElementNames;
    plural: string;
    symbol: ElementSymbols;
    description?: string;
    type: ElementType;
    class: any;
  };
};

export const sammElements: ElementInfo = {
  aspect: {
    name: 'Aspect',
    symbol: 'A',
    plural: 'Aspects',
    description: 'elementModelDescription.aspect',
    type: 'aspect',
    class: DefaultAspect,
  },
  'abstract-property': {
    name: 'Abstract Property',
    symbol: 'AP',
    plural: 'Abstract Properties',
    description: 'elementModelDescription.abstractProperty',
    type: 'abstract-property',
    class: DefaultProperty,
  },
  property: {
    name: 'Property',
    symbol: 'P',
    plural: 'Properties',
    description: 'elementModelDescription.property',
    type: 'property',
    class: DefaultProperty,
  },
  characteristic: {
    name: 'Characteristic',
    symbol: 'C',
    plural: 'Characteristics',
    description: 'elementModelDescription.characteristic',
    type: 'characteristic',
    class: DefaultCharacteristic,
  },
  'abstract-entity': {
    name: 'Abstract Entity',
    symbol: 'AE',
    plural: 'Abstract Entities',
    description: 'elementModelDescription.abstractEntity',
    type: 'abstract-entity',
    class: DefaultEntity,
  },
  entity: {
    name: 'Entity',
    symbol: 'E',
    plural: 'Entities',
    description: 'elementModelDescription.entity',
    type: 'entity',
    class: DefaultEntity,
  },
  entityInstance: {
    name: 'Entity Instance',
    symbol: 'e',
    plural: 'Entity Instances',
    description: 'elementModelDescription.entityInstance',
    type: 'entityInstance',
    class: DefaultEntityInstance,
  },
  unit: {
    name: 'Unit',
    symbol: 'U',
    plural: 'Units',
    description: 'elementModelDescription.unit',
    type: 'unit',
    class: DefaultUnit,
  },
  constraint: {
    name: 'Constraint',
    symbol: 'Co',
    plural: 'Constraints',
    description: 'elementModelDescription.constraint',
    type: 'constraint',
    class: DefaultConstraint,
  },
  trait: {
    name: 'Trait',
    symbol: 'T',
    plural: 'Traits',
    description: 'elementModelDescription.trait',
    type: 'trait',
    class: DefaultTrait,
  },
  operation: {
    name: 'Operation',
    symbol: 'O',
    plural: 'Operations',
    description: 'elementModelDescription.operation',
    type: 'operation',
    class: DefaultOperation,
  },
  event: {
    name: 'Event',
    symbol: 'Ev',
    plural: 'Events',
    description: 'elementModelDescription.event',
    type: 'event',
    class: DefaultEvent,
  },
  value: {
    name: 'Value',
    symbol: 'V',
    plural: 'Values',
    description: 'elementModelDescription.value',
    type: 'value',
    class: DefaultValue,
  },
};
