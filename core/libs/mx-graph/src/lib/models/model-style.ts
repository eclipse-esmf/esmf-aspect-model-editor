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
  DefaultAspect,
  DefaultProperty,
  DefaultOperation,
  DefaultConstraint,
  DefaultTrait,
  DefaultCharacteristic,
  DefaultEntity,
  DefaultUnit,
  DefaultEntityValue,
  DefaultEvent,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
} from '@ame/meta-model';

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
  ENTITY_VALUE = 'entityValue',
  ABSTRACT_ENTITY = 'abstractEntity',
  EVENT = 'event',
}

export class ModelStyleResolver {
  static resolve(metaModelElement: BaseMetaModelElement): ModelStyle {
    if (metaModelElement instanceof DefaultAspect) {
      return ModelStyle.ASPECT;
    } else if (metaModelElement instanceof DefaultProperty) {
      return ModelStyle.PROPERTY;
    } else if (metaModelElement instanceof DefaultAbstractProperty) {
      return ModelStyle.ABSTRACT_PROPERTY;
    } else if (metaModelElement instanceof DefaultOperation) {
      return ModelStyle.OPERATION;
    } else if (metaModelElement instanceof DefaultConstraint) {
      return ModelStyle.CONSTRAINT;
    } else if (metaModelElement instanceof DefaultTrait) {
      return ModelStyle.TRAIT;
    } else if (metaModelElement instanceof DefaultCharacteristic) {
      return ModelStyle.CHARACTERISTIC;
    } else if (metaModelElement instanceof DefaultAbstractEntity) {
      return ModelStyle.ABSTRACT_ENTITY;
    } else if (metaModelElement instanceof DefaultEntity) {
      return ModelStyle.ENTITY;
    } else if (metaModelElement instanceof DefaultUnit) {
      return ModelStyle.UNIT;
    } else if (metaModelElement instanceof DefaultEntityValue) {
      return ModelStyle.ENTITY_VALUE;
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
}
