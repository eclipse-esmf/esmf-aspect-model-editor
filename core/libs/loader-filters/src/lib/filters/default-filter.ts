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

import {LoadedFilesService} from '@ame/cache';
import {EdgeStyles, MaxGraphHelper} from '@ame/max-graph';
import {ShapeGeometry, basicShapeGeometry, circleShapeGeometry, smallBasicShapeGeometry} from '@ame/shared';
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
  NamedElement,
} from '@esmf/aspect-model-loader';
import {ArrowStyle, ChildrenArray, FilterLoader, ModelFilter, ModelTree, ModelTreeOptions} from '../models';

const abstractRelations: Record<string, string[]> = {
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
  VALUE = 'value',
}

export class DefaultFilter implements FilterLoader {
  cache: Record<string, boolean> = {};
  readonly filterType: ModelFilter = ModelFilter.DEFAULT;
  readonly visibleElements = [
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
  ];

  constructor(public readonly loadedFiles: LoadedFilesService) {}

  filter(rootElements: NamedElement[]): ModelTree<NamedElement>[] {
    return (rootElements || []).map(element => this.generateTree(element));
  }

  generateTree(element: NamedElement, options?: ModelTreeOptions): ModelTree<NamedElement> {
    if (!element) {
      return null;
    }

    const elementTree: ModelTree<NamedElement> = {
      element,
      fromParentArrow: this.getArrowStyle(element, options?.parent),
      children: new ChildrenArray(),
      shape: {...this.getShapeGeometry(element), maxgraphStyle: {baseStyleNames: [this.getMaxgraphStyle(element)]}},
      filterType: this.filterType,
    };

    for (const child of element.children || []) {
      if (this.loadedFiles.isElementExtern(child) && this.loadedFiles.isElementExtern(element)) {
        continue;
      }

      const cacheKey = `${element.aspectModelUrn} - ${child.aspectModelUrn}`;
      if (this.cache[cacheKey]) {
        continue;
      }
      this.cache[cacheKey] = true;
      elementTree.children.push(this.generateTree(child, {parent: element}));
    }

    return elementTree;
  }

  getArrowStyle(element: NamedElement, parent: NamedElement): ArrowStyle {
    if (!parent || !element) {
      return null;
    }

    if (parent instanceof DefaultEntityInstance && !(element instanceof DefaultEntityInstance)) {
      return EdgeStyles.entityValueEntityEdge;
    }

    if (MaxGraphHelper.isOptionalProperty(element as DefaultProperty, parent)) {
      return EdgeStyles.optionalPropertyEdge;
    }

    if (element instanceof DefaultProperty && element.isAbstract && parent instanceof DefaultProperty) {
      return EdgeStyles.abstractPropertyEdge;
    }

    if (abstractRelations[parent?.className]?.includes(element?.className)) {
      return EdgeStyles.abstractElementEdge;
    }

    return EdgeStyles.defaultEdge;
  }

  getShapeGeometry(element: NamedElement): ShapeGeometry {
    if (element instanceof DefaultTrait) {
      return circleShapeGeometry;
    }

    if (element instanceof DefaultEntityInstance) {
      return smallBasicShapeGeometry;
    }

    return basicShapeGeometry;
  }

  getMaxgraphStyle(element: NamedElement): string {
    if (element instanceof DefaultAspect) {
      return ModelStyle.ASPECT;
    } else if (element instanceof DefaultProperty && !element.isAbstract) {
      return ModelStyle.PROPERTY;
    } else if (element instanceof DefaultProperty && element.isAbstract) {
      return ModelStyle.ABSTRACT_PROPERTY;
    } else if (element instanceof DefaultOperation) {
      return ModelStyle.OPERATION;
    } else if (element instanceof DefaultConstraint) {
      return ModelStyle.CONSTRAINT;
    } else if (element instanceof DefaultTrait) {
      return ModelStyle.TRAIT;
    } else if (element instanceof DefaultCharacteristic) {
      return ModelStyle.CHARACTERISTIC;
    } else if (element instanceof DefaultEntity && element.isAbstractEntity()) {
      return ModelStyle.ABSTRACT_ENTITY;
    } else if (element instanceof DefaultEntity) {
      return ModelStyle.ENTITY;
    } else if (element instanceof DefaultUnit) {
      return ModelStyle.UNIT;
    } else if (element instanceof DefaultEntityInstance) {
      return ModelStyle.ENTITY_VALUE;
    } else if (element instanceof DefaultEvent) {
      return ModelStyle.EVENT;
    } else if (element instanceof DefaultValue) {
      return ModelStyle.VALUE;
    }
    return null;
  }

  hasOverlay(): boolean {
    return true;
  }
}
