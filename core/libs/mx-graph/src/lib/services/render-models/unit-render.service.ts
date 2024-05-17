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

import {Injectable, inject} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {DefaultUnit} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphRenderer} from '../../renderers';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {RdfService} from '@ame/rdf/services';
import {FiltersService} from '@ame/loader-filters';

@Injectable({
  providedIn: 'root'
})
export class UnitRenderService extends BaseRenderService {
  private filterService = inject(FiltersService);

  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    rdfService: RdfService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private namespacesCacheService: NamespacesCacheService
  ) {
    super(mxGraphService, sammLangService, rdfService);
  }

  create(parentCell: mxgraph.mxCell, unit: DefaultUnit) {
    this.removeFrom(parentCell);

    // create shape for new unit
    new MxGraphRenderer(
      this.mxGraphService,
      this.mxGraphShapeOverlayService,
      this.namespacesCacheService,
      this.sammLangService,
      null
    ).renderUnit(this.filterService.createNode(unit, {parent: MxGraphHelper.getModelElement(parentCell)}), parentCell);
  }

  removeFrom(parentCell: mxgraph.mxCell) {
    const edges = this.mxGraphService.graph.getOutgoingEdges(parentCell);
    const edgeToUnit = edges.find(edge => MxGraphHelper.getModelElement(edge?.target) instanceof DefaultUnit);
    const unit = edgeToUnit ? MxGraphHelper.getModelElement<DefaultUnit>(edgeToUnit.target) : null;
    const parent = MxGraphHelper.getModelElement(parentCell);

    if (edgeToUnit && unit?.isPredefined()) {
      MxGraphHelper.removeRelation(parent, unit);
      this.namespacesCacheService.currentCachedFile.removeElement(unit.aspectModelUrn);
      this.mxGraphService.removeCells([edgeToUnit.target], true);
    } else if (edgeToUnit) {
      MxGraphHelper.removeRelation(parent, unit);
      this.mxGraphService.removeCells([edgeToUnit], true);
    }
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultUnit;
  }
}
