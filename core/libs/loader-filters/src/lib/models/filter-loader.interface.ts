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

import {ShapeGeometry} from '@ame/shared';
import {NamedElement} from '@esmf/aspect-model-loader';

/**
 * Generates class type which implements an interface
 */
export type ClassReference<T = NamedElement, Args extends any[] = any[]> = new (...args: Args) => T;

export type ArrowStyle = 'entityValueEntityEdge' | 'optionalPropertyEdge' | 'abstractPropertyEdge' | 'abstractElementEdge' | 'defaultEdge';

export class ChildrenArray<T extends ModelTree<NamedElement>> extends Array<ModelTree<NamedElement>> {
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

export interface ModelTree<T extends NamedElement> {
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
  children?: ChildrenArray<ModelTree<NamedElement>>;
  /**
   * Identifier for used filtering
   */
  filterType: 'default' | 'properties';
}

export type ModelTreeOptions = Partial<{
  /**
   * Parent from the filtered structure
   */
  parent: NamedElement;
  /**
   * Parent node from the filtered structure
   */
  parentNode: ModelTree<NamedElement>;
  /**
   * Any class in this list will not be considered for the next filter loop
   */
  notAllowed: ClassReference<NamedElement>[];
}>;

export enum ModelFilter {
  DEFAULT = 'default',
  PROPERTIES = 'properties',
}

export interface FilterLoader<T extends NamedElement = NamedElement> {
  cache: {[key: string]: boolean};
  filterType: ModelFilter;
  visibleElements: ClassReference<T>[];
  filter(rootElements: T[]): ModelTree<T>[];
  generateTree(element: T, options?: ModelTreeOptions): ModelTree<T>;
  getArrowStyle(element: T, parent: T): ArrowStyle;
  getShapeGeometry(element: T): ShapeGeometry;
  getMxGraphStyle(element: T): string;
  hasOverlay(element?: T): boolean;
}
