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

import {NamedElement} from '@esmf/aspect-model-loader';
import {ShapeGeometry} from '../../common/constants/shape-geometry';

export type ArrowStyle = 'entityValueEntityEdge' | 'optionalPropertyEdge' | 'abstractPropertyEdge' | 'abstractElementEdge' | 'defaultEdge';

export class ChildrenArray<T extends ModelTree<NamedElement> = ModelTree<NamedElement>> extends Array<T> {
  override push(...items: T[]): number {
    let pushed = 0;
    for (const item of items) {
      if (!item || this.some(i => i?.element?.aspectModelUrn === item.element?.aspectModelUrn)) {
        continue;
      }

      super.push(item);
      pushed++;
    }
    return pushed;
  }
}

export interface ModelTree<T extends NamedElement = NamedElement> {
  /**
   * The meta model element which will be rendered
   */
  element: T;
  /**
   * Geometrical shape the element will have in the maxGraph
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
  filterType?: 'default' | 'properties';
}
