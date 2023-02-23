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
import {NamespacesCacheService} from '@ame/cache';
import {DefaultUnit} from '@ame/meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphSetupVisitor} from '../../visitors';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {RdfService} from '@ame/rdf/services';

@Injectable({
  providedIn: 'root',
})
export class UnitRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    languageSettingsService: LanguageSettingsService,
    rdfService: RdfService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private namespacesCacheService: NamespacesCacheService
  ) {
    super(mxGraphService, languageSettingsService, rdfService);
  }

  create(parentCell: mxgraph.mxCell, unit: DefaultUnit) {
    this.removeFrom(parentCell);

    // create shape for new unit
    new MxGraphSetupVisitor(
      this.mxGraphService,
      this.mxGraphShapeOverlayService,
      this.namespacesCacheService,
      this.languageSettingsService,
      null
    ).visitUnit(unit, parentCell);
  }

  removeFrom(parentCell: mxgraph.mxCell) {
    const edges = this.mxGraphService.graph.getOutgoingEdges(parentCell);
    const unitCell = edges.find(edge => MxGraphHelper.getModelElement(edge?.target) instanceof DefaultUnit);
    if (unitCell && (MxGraphHelper.getModelElement(unitCell.target) as DefaultUnit).isPredefined()) {
      this.mxGraphService.graph.removeCells([unitCell.target], true);
    } else if (unitCell) {
      this.mxGraphService.graph.removeCells([unitCell], true);
    }
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultUnit;
  }
}
