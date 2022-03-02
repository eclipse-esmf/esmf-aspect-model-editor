/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
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
} from '@bame/meta-model';

/**
 * This style class names will refer to src/assets/config/editor/config/stylesheet.xml
 */
export enum ModelStyle {
  ASPECT = 'aspect',
  PROPERTY = 'property',
  OPERATION = 'operation',
  CHARACTERISTIC = 'characteristic',
  CONSTRAINT = 'constraint',
  ENTITY = 'entity',
  UNIT = 'unit',
  TRAIT = 'trait',
  ENTITY_VALUE = 'entityValue',
  EVENT = 'event'
}

export class ModelStyleResolver {
  static resolve(metaModelElement: BaseMetaModelElement): ModelStyle {
    if (metaModelElement instanceof DefaultAspect) {
      return ModelStyle.ASPECT;
    } else if (metaModelElement instanceof DefaultProperty) {
      return ModelStyle.PROPERTY;
    } else if (metaModelElement instanceof DefaultOperation) {
      return ModelStyle.OPERATION;
    } else if (metaModelElement instanceof DefaultConstraint) {
      return ModelStyle.CONSTRAINT;
    } else if (metaModelElement instanceof DefaultTrait) {
      return ModelStyle.TRAIT;
    } else if (metaModelElement instanceof DefaultCharacteristic) {
      return ModelStyle.CHARACTERISTIC;
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
