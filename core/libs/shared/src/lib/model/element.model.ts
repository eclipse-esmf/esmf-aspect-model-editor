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
    description: 'ELEMENT_MODEL_DESCRIPTION.ASPECT',
    type: 'aspect',
    class: DefaultAspect,
  },
  event: {
    name: 'Event',
    symbol: 'Ev',
    plural: 'Events',
    description: 'ELEMENT_MODEL_DESCRIPTION.EVENT',
    type: 'event',
    class: DefaultEvent,
  },
  operation: {
    name: 'Operation',
    symbol: 'O',
    plural: 'Operations',
    description: 'ELEMENT_MODEL_DESCRIPTION.OPERATION',
    type: 'operation',
    class: DefaultOperation,
  },
  property: {
    name: 'Property',
    symbol: 'P',
    plural: 'Properties',
    description: 'ELEMENT_MODEL_DESCRIPTION.PROPERTY',
    type: 'property',
    class: DefaultProperty,
  },
  'abstract-property': {
    name: 'Abstract Property',
    symbol: 'AP',
    plural: 'Abstract Properties',
    description: 'ELEMENT_MODEL_DESCRIPTION.ABSTRACT_PROPERTY',
    type: 'abstract-property',
    class: DefaultProperty,
  },
  entity: {
    name: 'Entity',
    symbol: 'E',
    plural: 'Entities',
    description: 'ELEMENT_MODEL_DESCRIPTION.ENTITY',
    type: 'entity',
    class: DefaultEntity,
  },
  'abstract-entity': {
    name: 'Abstract Entity',
    symbol: 'AE',
    plural: 'Abstract Entities',
    description: 'ELEMENT_MODEL_DESCRIPTION.ABSTRACT_ENTITY',
    type: 'abstract-entity',
    class: DefaultEntity,
  },
  unit: {
    name: 'Unit',
    symbol: 'U',
    plural: 'Units',
    description: 'ELEMENT_MODEL_DESCRIPTION.UNIT',
    type: 'unit',
    class: DefaultUnit,
  },
  constraint: {
    name: 'Constraint',
    symbol: 'Co',
    plural: 'Constraints',
    description: 'ELEMENT_MODEL_DESCRIPTION.CONSTRAINT',
    type: 'constraint',
    class: DefaultConstraint,
  },
  trait: {
    name: 'Trait',
    symbol: 'T',
    plural: 'Traits',
    description: 'ELEMENT_MODEL_DESCRIPTION.TRAIT',
    type: 'trait',
    class: DefaultTrait,
  },
  characteristic: {
    name: 'Characteristic',
    symbol: 'C',
    plural: 'Characteristics',
    description: 'ELEMENT_MODEL_DESCRIPTION.CHARACTERISTIC',
    type: 'characteristic',
    class: DefaultCharacteristic,
  },
  entityInstance: {
    name: 'Entity Instance',
    symbol: 'e',
    plural: 'Entity Instances',
    description: 'ELEMENT_MODEL_DESCRIPTION.ENTITY_INSTANCE',
    type: 'entityInstance',
    class: DefaultEntityInstance,
  },
  value: {
    name: 'Value',
    symbol: 'V',
    plural: 'Values',
    description: 'ELEMENT_MODEL_DESCRIPTION.VALUE',
    type: 'value',
    class: DefaultValue,
  },
};
