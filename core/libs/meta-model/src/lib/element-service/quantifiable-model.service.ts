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

import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultQuantifiable, DefaultUnit, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class QuantifiableModelService extends BaseModelService {
  constructor(
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultQuantifiable;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultQuantifiable = MxGraphHelper.getModelElement(cell);
    if (!form.unit) {
      metaModelElement.unit = new DefaultUnit({name: '', aspectModelUrn: '', metaModelVersion: '', quantityKinds: []});
    } else {
      metaModelElement.unit = form.unit;
    }
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.mxGraphService.removeCells([cell]);
  }
}
