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

import {ArrowStyle, ChildrenArray, ModelFilter, ModelTree, ShapeGeometry} from '@ame/shared';
import {NamedElement} from '@esmf/aspect-model-loader';

export {ArrowStyle, ChildrenArray, ModelFilter, ModelTree};

/**
 * Generates class type which implements an interface
 */
export type ClassReference<T = NamedElement, Args extends any[] = any[]> = new (...args: Args) => T;

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

export interface FilterLoader<T extends NamedElement = NamedElement> {
  cache: Record<string, boolean>;
  filterType: ModelFilter;
  visibleElements: ClassReference<T>[];
  filter(rootElements: T[]): ModelTree<T>[];
  generateTree(element: T, options?: ModelTreeOptions): ModelTree<T>;
  getArrowStyle(element: T, parent: T): ArrowStyle;
  getShapeGeometry(element: T): ShapeGeometry;
  getMaxgraphStyle(element: T): string;
  hasOverlay(element?: T): boolean;
}
