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

import {FiltersService} from '@ame/loader-filters';
import {Injectable, inject} from '@angular/core';
import {DefaultUnit} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper} from '../../helpers';
import {MaxGraphRenderer} from '../../renderers';
import {MaxGraphShapeOverlayService} from '../max-graph-shape-overlay.service';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class UnitRenderService extends BaseRenderService {
  private readonly filterService = inject(FiltersService);
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);

  create(parentCell: Cell, unit: DefaultUnit) {
    this.removeFrom(parentCell);

    // create shape for new unit
    new MaxGraphRenderer(this.maxgraphService, this.maxgraphShapeOverlayService, this.sammLangService, null).renderUnit(
      this.filterService.createNode(unit, {parent: MaxGraphHelper.getModelElement(parentCell)}),
      parentCell,
    );
  }

  removeFrom(parentCell: Cell) {
    const edges = this.maxgraphService.graph.getOutgoingEdges(parentCell, null);
    const edgeToUnit = edges.find(edge => MaxGraphHelper.getModelElement(edge?.target) instanceof DefaultUnit);
    const unit = edgeToUnit ? MaxGraphHelper.getModelElement<DefaultUnit>(edgeToUnit.target) : null;
    const parent = MaxGraphHelper.getModelElement(parentCell);

    if (edgeToUnit && unit?.isPredefined) {
      MaxGraphHelper.removeRelation(parent, unit);
      this.loadedFilesService.currentLoadedFile.cachedFile.removeElement(unit.aspectModelUrn);
      this.maxgraphService.removeCells([edgeToUnit.target], true);
    } else if (edgeToUnit) {
      MaxGraphHelper.removeRelation(parent, unit);
      this.maxgraphService.removeCells([edgeToUnit], true);
    }
  }

  isApplicable(cell: Cell): boolean {
    return MaxGraphHelper.getModelElement(cell) instanceof DefaultUnit;
  }
}
