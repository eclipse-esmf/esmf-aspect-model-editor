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

import {ModelTree} from '@ame/loader-filters';
import {circleShapeGeometry, smallBasicShapeGeometry} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Cell, Geometry} from '@maxgraph/core';
import {MaxGraphAttributeService} from './max-graph-attribute.service';

@Injectable({providedIn: 'root'})
export class MaxGraphGeometryProviderService {
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  public createGeometry(node: ModelTree<NamedElement>, x?: number, y?: number): Geometry {
    return this.maxgraphAttributeService.inCollapsedMode
      ? new Geometry(x, y, node.shape.collapsedWidth, node.shape.collapsedHeight)
      : new Geometry(x, y, node.shape.expandedWith, node.shape.expandedHeight);
  }

  /**
   * When we add a new Trait in collapsed mode we need to resize the cell.
   *
   * @param cell - trait to resize
   */
  public upgradeTraitGeometry(cell: Cell, geometry: Geometry, isVertex: boolean): void {
    if (cell.style.fillColor.includes('trait') && isVertex && geometry != null) {
      geometry.width = circleShapeGeometry.collapsedWidth;
      geometry.height = circleShapeGeometry.collapsedHeight;
    }
  }

  /**
   * When we add a new EntityValue in collapsed mode we need to resize the cell.
   *
   * @param cell - entity value to resize
   */
  public upgradeEntityValueGeometry(cell: Cell, geometry: Geometry, isVertex: boolean): void {
    if (cell.style.fillColor.includes('entityValue') && isVertex && geometry != null) {
      geometry.width = smallBasicShapeGeometry.collapsedWidth;
      geometry.height = smallBasicShapeGeometry.collapsedHeight;
    }
  }
}
