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

import {ShapeGeometry, basicShapeGeometry, circleShapeGeometry, smallBasicShapeGeometry} from '@ame/shared';
import {ArrowStyle, ChildrenArray, FilterLoader, ModelFilter, ModelTree, ModelTreeOptions} from '../models';
import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
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
} from '@ame/meta-model';
import {EdgeStyles, MxGraphHelper} from '@ame/mx-graph';

const abstractRelations = {
  DefaultAbstractEntity: ['DefaultAbstractEntity'],
  DefaultEntity: ['DefaultAbstractEntity', 'DefaultEntity'],
  DefaultProperty: ['DefaultAbstractProperty', 'DefaultProperty'],
  DefaultAbstractProperty: ['DefaultAbstractProperty'],
};

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

export class DefaultFilter implements FilterLoader {
  cache = {};
  filterType: ModelFilter = ModelFilter.DEFAULT;
  visibleElements = [
    DefaultAbstractEntity,
    DefaultAbstractProperty,
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
  ];

  filter(rootElements: BaseMetaModelElement[]): ModelTree<BaseMetaModelElement>[] {
    return rootElements.map(element => this.generateTree(element));
  }

  generateTree(element: BaseMetaModelElement, options?: ModelTreeOptions): ModelTree<BaseMetaModelElement> {
    if (!element) {
      return null;
    }

    const elementTree: ModelTree<BaseMetaModelElement> = {
      element,
      fromParentArrow: this.getArrowStyle(element, options?.parent),
      children: new ChildrenArray(),
      shape: {...this.getShapeGeometry(element), mxGraphStyle: this.getMxGraphStyle(element)},
      filterType: this.filterType,
    };

    for (const child of element.children) {
      if (child.isExternalReference() && element.isExternalReference()) {
        continue;
      }

      if (this.cache[`${element.aspectModelUrn} - ${child.aspectModelUrn}`]) {
        continue;
      }
      this.cache[`${element.aspectModelUrn} - ${child.aspectModelUrn}`] = true;
      elementTree.children.push(this.generateTree(child, {parent: element}));
    }

    return elementTree;
  }

  getArrowStyle(element: BaseMetaModelElement, parent: BaseMetaModelElement): ArrowStyle {
    if (!parent || !element) {
      return null;
    }

    return parent instanceof DefaultEntityInstance && !(element instanceof DefaultEntityInstance)
      ? EdgeStyles.entityValueEntityEdge
      : MxGraphHelper.isOptionalProperty(element as DefaultProperty, parent)
        ? EdgeStyles.optionalPropertyEdge
        : element instanceof DefaultAbstractProperty && parent instanceof DefaultProperty
          ? EdgeStyles.abstractPropertyEdge
          : abstractRelations[parent?.className]?.includes(element?.className)
            ? EdgeStyles.abstractElementEdge
            : EdgeStyles.defaultEdge;
  }

  getShapeGeometry(element: BaseMetaModelElement): ShapeGeometry {
    if (element instanceof DefaultTrait) {
      return circleShapeGeometry;
    }

    if (element instanceof DefaultEntityInstance) {
      return smallBasicShapeGeometry;
    }

    return basicShapeGeometry;
  }

  getMxGraphStyle(element: BaseMetaModelElement): string {
    if (element instanceof DefaultAspect) {
      return ModelStyle.ASPECT;
    } else if (element instanceof DefaultProperty) {
      return ModelStyle.PROPERTY;
    } else if (element instanceof DefaultAbstractProperty) {
      return ModelStyle.ABSTRACT_PROPERTY;
    } else if (element instanceof DefaultOperation) {
      return ModelStyle.OPERATION;
    } else if (element instanceof DefaultConstraint) {
      return ModelStyle.CONSTRAINT;
    } else if (element instanceof DefaultTrait) {
      return ModelStyle.TRAIT;
    } else if (element instanceof DefaultCharacteristic) {
      return ModelStyle.CHARACTERISTIC;
    } else if (element instanceof DefaultAbstractEntity) {
      return ModelStyle.ABSTRACT_ENTITY;
    } else if (element instanceof DefaultEntity) {
      return ModelStyle.ENTITY;
    } else if (element instanceof DefaultUnit) {
      return ModelStyle.UNIT;
    } else if (element instanceof DefaultEntityInstance) {
      return ModelStyle.ENTITY_VALUE;
    } else if (element instanceof DefaultEvent) {
      return ModelStyle.EVENT;
    }
    return null;
  }

  hasOverlay(): boolean {
    return true;
  }
}
