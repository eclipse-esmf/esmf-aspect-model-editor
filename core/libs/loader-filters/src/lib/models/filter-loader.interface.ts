/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {BaseMetaModelElement} from '@ame/meta-model';
import {ShapeGeometry} from '@ame/shared';

/**
 * Generates class type which implements an interface
 */
export type ClassImplementing<BaseMetaModelElement, Args extends any[] = any[]> = new (...args: Args) => BaseMetaModelElement;

export type ArrowStyle = 'entityValueEntityEdge' | 'optionalPropertyEdge' | 'abstractPropertyEdge' | 'abstractElementEdge' | 'defaultEdge';

export class ChildrenArray<T extends ModelTree> extends Array<ModelTree> {
  push(...items: T[]): number {
    let pushed = 0;
    for (const item of items) {
      if (this.some(i => i.element.aspectModelUrn === item.element.aspectModelUrn)) {
        continue;
      }

      super.push(item);
      pushed++;
    }
    return pushed;
  }
}

export interface ModelTree<T = BaseMetaModelElement> {
  /**
   * The meta model element which will be rendered
   */
  element: T;
  /**
   * Geometrical shape the element will have in the mxGraph
   *
   * `default` - rectangle shape |
   * `connector` - small circle shape
   */
  shape?: ShapeGeometry;
  /**
   * Arrow style
   */
  fromParentArrow?: ArrowStyle;
  /**
   * ModelTree structures which represents the element's children
   */
  children?: ChildrenArray<ModelTree>;
  /**
   * Identifier for used filtering
   */
  filterType: 'default' | 'properties';
}

export type ModelTreeOptions = Partial<{
  /**
   * Parent from the filtered structure
   */
  parent: BaseMetaModelElement;
  /**
   * Parent node from the filtered structure
   */
  parentNode: ModelNode<BaseMetaModelElement>;
  /**
   * Any class in this list will not be considered for the next filter loop
   */
  notAllowed: ClassImplementing<BaseMetaModelElement>[];
}>;

export type ModelNode<T> = ModelTree<T>;

export enum ModelFilter {
  DEFAULT = 'default',
  PROPERTIES = 'properties',
}

export interface FilterLoader {
  cache: {[key: string]: boolean};
  filterType: ModelFilter;
  visibleElements: ClassImplementing<BaseMetaModelElement>[];
  filter(rootElements: BaseMetaModelElement[]): ModelTree[];
  generateTree<T extends BaseMetaModelElement>(element: T, options?: ModelTreeOptions): ModelTree<T>;
  getArrowStyle(element: BaseMetaModelElement, parent: BaseMetaModelElement): ArrowStyle;
  getShapeGeometry(element: BaseMetaModelElement): ShapeGeometry;
  getMxGraphStyle(element: BaseMetaModelElement): string;
  hasOverlay(element?: BaseMetaModelElement): boolean;
}
