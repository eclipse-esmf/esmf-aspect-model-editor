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

import {Injectable} from '@angular/core';
import {BaseMetaModelElement, DefaultEntityValue, DefaultTrait} from '@ame/meta-model';
import {circleShapeGeometry, basicShapeGeometry, smallBasicShapeGeometry} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {mxGeometry} from '../providers';
import {MxGraphAttributeService} from './mx-graph-attribute.service';
import {ModelNode} from '@ame/loader-filters';

@Injectable()
export class MxGraphGeometryProviderService {
  constructor(private mxGraphAttributeService: MxGraphAttributeService) {}

  public createGeometry(node: ModelNode<BaseMetaModelElement>, x?: number, y?: number): mxgraph.mxGeometry {
    return this.mxGraphAttributeService.inCollapsedMode
      ? new mxGeometry(x, y, node.shape.collapsedWidth, node.shape.collapsedHeight)
      : new mxGeometry(x, y, node.shape.expandedWith, node.shape.expandedHeight);
  }

  /**
   * When we add a new Trait in collapsed mode we need to resize the cell.
   *
   * @param cell - trait to resize
   */
  public upgradeTraitGeometry(cell: mxgraph.mxCell, geometry: mxgraph.mxGeometry, isVertex: boolean): void {
    if (cell.style.includes('trait') && isVertex && geometry != null) {
      geometry.width = circleShapeGeometry.collapsedWidth;
      geometry.height = circleShapeGeometry.collapsedHeight;
    }
  }

  /**
   * When we add a new EntityValue in collapsed mode we need to resize the cell.
   *
   * @param cell - entity value to resize
   */
  public upgradeEntityValueGeometry(cell: mxgraph.mxCell, geometry: mxgraph.mxGeometry, isVertex: boolean): void {
    if (cell.style.includes('entityValue') && isVertex && geometry != null) {
      geometry.width = smallBasicShapeGeometry.collapsedWidth;
      geometry.height = smallBasicShapeGeometry.collapsedHeight;
    }
  }

  private createExpandedGeometry(metaModelElement: BaseMetaModelElement, x?: number, y?: number): mxgraph.mxGeometry {
    switch (true) {
      case this.isEllipseShape(metaModelElement):
        return new mxGeometry(x, y, circleShapeGeometry.expandedWith, circleShapeGeometry.expandedHeight);
      case this.isRoundedBorderShape(metaModelElement):
        return new mxGeometry(x, y, smallBasicShapeGeometry.expandedWith, smallBasicShapeGeometry.expandedHeight);
      default:
        return new mxGeometry(x, y, basicShapeGeometry.expandedWith, basicShapeGeometry.expandedHeight);
    }
  }

  private createCollapsedGeometry(
    metaModelElement: BaseMetaModelElement,
    x?: number,
    y?: number,
    w?: number,
    h?: number
  ): mxgraph.mxGeometry {
    switch (true) {
      case this.isEllipseShape(metaModelElement):
        return new mxGeometry(x, y, circleShapeGeometry.collapsedWidth, circleShapeGeometry.collapsedHeight);
      case this.isRoundedBorderShape(metaModelElement):
        return new mxGeometry(x, y, smallBasicShapeGeometry.collapsedWidth, smallBasicShapeGeometry.collapsedHeight);
      default:
        return new mxGeometry(x, y, w ? w : basicShapeGeometry.collapsedWidth, h ? h : basicShapeGeometry.collapsedHeight);
    }
  }

  private isEllipseShape(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultTrait;
  }

  private isRoundedBorderShape(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEntityValue;
  }
}
