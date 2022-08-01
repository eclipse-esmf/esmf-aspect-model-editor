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

import {Injectable} from '@angular/core';
import {BaseMetaModelElement, DefaultTrait, DefaultEntityValue, DefaultAbstractEntity} from '@ame/meta-model';
import {ExpandedEllipseShape, ExpandedRoundBorderShape, ExpandedModelShape, ExpandedMiniShape} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {mxGeometry} from '../providers';
import {MxGraphAttributeService} from './mx-graph-attribute.service';

@Injectable()
export class MxGraphGeometryProviderService {
  constructor(private mxGraphAttributeService: MxGraphAttributeService) {}

  public createGeometry(metaModelElement: BaseMetaModelElement, x?: number, y?: number, w?: number, h?: number): mxgraph.mxGeometry {
    return this.mxGraphAttributeService.inCollapsedMode
      ? this.createCollapsedGeometry(metaModelElement, x, y, w, h)
      : this.createExpandedGeometry(metaModelElement, x, y);
  }

  /**
   * When we add a new Trait in collapsed mode we need to resize the cell.
   *
   * @param cell - trait to resize
   */
  public upgradeTraitGeometry(cell: mxgraph.mxCell, geometry: mxgraph.mxGeometry, isVertex: boolean): void {
    if (cell.style.includes('trait') && isVertex && geometry != null) {
      geometry.width = ExpandedEllipseShape.collapsedEllipseElementWidth;
      geometry.height = ExpandedEllipseShape.collapsedEllipseElementHeight;
    }
  }

  /**
   * When we add a new EntityValue in collapsed mode we need to resize the cell.
   *
   * @param cell - entity value to resize
   */
  public upgradeEntityValueGeometry(cell: mxgraph.mxCell, geometry: mxgraph.mxGeometry, isVertex: boolean): void {
    if (cell.style.includes('entityValue') && isVertex && geometry != null) {
      geometry.width = ExpandedRoundBorderShape.collapsedRoundBorderWidth;
      geometry.height = ExpandedRoundBorderShape.collapsedRoundBorderHeight;
    }
  }

  public createDefaultGeometry(): mxgraph.mxGeometry {
    return new mxGeometry(0, 0, ExpandedModelShape.expandedElementWidth, ExpandedModelShape.parameterHeight);
  }

  private createExpandedGeometry(metaModelElement: BaseMetaModelElement, x?: number, y?: number): mxgraph.mxGeometry {
    switch (true) {
      case this.isEllipseShape(metaModelElement):
        return new mxGeometry(x, y, ExpandedEllipseShape.expandedEllipseElementWidth, ExpandedEllipseShape.expandedEllipseElementHeight);
      case this.isRoundedBorderShape(metaModelElement):
        return new mxGeometry(x, y, ExpandedRoundBorderShape.expandedRoundBorderWidth, ExpandedRoundBorderShape.expandedRoundBorderHeight);
      case this.isMiniShape(metaModelElement):
        return new mxGeometry(x, y, ExpandedMiniShape.expandedRoundBorderWidth, ExpandedMiniShape.expandedRoundBorderHeight);
      default:
        return new mxGeometry(x, y, ExpandedModelShape.expandedElementWidth, ExpandedModelShape.expandedElementHeight);
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
        return new mxGeometry(x, y, ExpandedEllipseShape.collapsedEllipseElementWidth, ExpandedEllipseShape.collapsedEllipseElementHeight);
      case this.isRoundedBorderShape(metaModelElement):
        return new mxGeometry(
          x,
          y,
          ExpandedRoundBorderShape.collapsedRoundBorderWidth,
          ExpandedRoundBorderShape.collapsedRoundBorderHeight
        );
      case this.isMiniShape(metaModelElement):
        return new mxGeometry(x, y, ExpandedMiniShape.collapsedRoundBorderWidth, ExpandedMiniShape.collapsedRoundBorderHeight);
      default:
        return new mxGeometry(x, y, w ? w : ExpandedModelShape.collapsedElementWidth, h ? h : ExpandedModelShape.collapsedElementHeight);
    }
  }

  private isEllipseShape(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultTrait;
  }

  private isRoundedBorderShape(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEntityValue;
  }

  private isMiniShape(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAbstractEntity;
  }
}
