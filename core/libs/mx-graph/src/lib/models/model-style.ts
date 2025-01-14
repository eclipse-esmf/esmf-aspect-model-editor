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
  NamedElement,
} from '@esmf/aspect-model-loader';

/**
 * This style class names will refer to src/assets/config/editor/config/stylesheet.xml
 */
export enum ModelStyle {
  ASPECT = 'aspect',
  PROPERTY = 'property',
  ABSTRACT_PROPERTY = 'abstractProperty',
  OPERATION = 'operation',
  CHARACTERISTIC = 'characteristic',
  CONSTRAINT = 'constraint',
  ENTITY = 'entity',
  UNIT = 'unit',
  TRAIT = 'trait',
  ENTITY_INSTANCE = 'entityInstance',
  ABSTRACT_ENTITY = 'abstractEntity',
  EVENT = 'event',
}

export enum EdgeStyles {
  entityValueEntityEdge = 'entityValueEntityEdge',
  optionalPropertyEdge = 'optionalPropertyEdge',
  abstractPropertyEdge = 'abstractPropertyEdge',
  abstractElementEdge = 'abstractElementEdge',
  defaultEdge = 'defaultEdge',
}

export class ModelStyleResolver {
  static resolve(metaModelElement: NamedElement): ModelStyle {
    if (metaModelElement instanceof DefaultAspect) {
      return ModelStyle.ASPECT;
    } else if (metaModelElement instanceof DefaultProperty && !metaModelElement.isAbstract) {
      return ModelStyle.PROPERTY;
    } else if (metaModelElement instanceof DefaultProperty && metaModelElement.isAbstract) {
      return ModelStyle.ABSTRACT_PROPERTY;
    } else if (metaModelElement instanceof DefaultOperation) {
      return ModelStyle.OPERATION;
    } else if (metaModelElement instanceof DefaultConstraint) {
      return ModelStyle.CONSTRAINT;
    } else if (metaModelElement instanceof DefaultTrait) {
      return ModelStyle.TRAIT;
    } else if (metaModelElement instanceof DefaultCharacteristic) {
      return ModelStyle.CHARACTERISTIC;
    } else if (metaModelElement instanceof DefaultEntity && metaModelElement.isAbstractEntity()) {
      return ModelStyle.ABSTRACT_ENTITY;
    } else if (metaModelElement instanceof DefaultEntity) {
      return ModelStyle.ENTITY;
    } else if (metaModelElement instanceof DefaultUnit) {
      return ModelStyle.UNIT;
    } else if (metaModelElement instanceof DefaultEntityInstance) {
      return ModelStyle.ENTITY_INSTANCE;
    } else if (metaModelElement instanceof DefaultEvent) {
      return ModelStyle.EVENT;
    }
    return null;
  }
}

export interface ModelBaseProperties {
  version: string;
  namespace: string;
  fileName: string;
  external: boolean;
  predefined: boolean;
  sameNamespace: boolean;
  sameVersionedNamespace: boolean;
  isAbstract: boolean;
  sammVersion: string;
}
