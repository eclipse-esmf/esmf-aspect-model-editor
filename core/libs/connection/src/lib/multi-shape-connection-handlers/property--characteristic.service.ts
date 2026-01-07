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

import {MxGraphAttributeService, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {basicShapeGeometry} from '@ame/shared';
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, DefaultProperty, DefaultValue, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class PropertyCharacteristicConnectionHandler implements MultiShapeConnector<DefaultProperty, DefaultCharacteristic> {
  private mxGraphService = inject(MxGraphService);
  private mxGraphAttributeService = inject(MxGraphAttributeService);

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultCharacteristic, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach((outEdge: mxgraph.mxCell) => {
      // moves the cell being disconnected(arrow removal) in order to prevent overlapping overlays
      if (outEdge.target?.geometry?.x < basicShapeGeometry.expandedWith) {
        outEdge.target.geometry.translate(basicShapeGeometry.expandedWith, 0);
      }

      const targetModel = MxGraphHelper.getModelElement<NamedElement>(outEdge.target);
      if (targetModel instanceof DefaultProperty || targetModel instanceof DefaultValue) {
        return;
      }

      MxGraphHelper.removeRelation(parentMetaModel, targetModel);
      this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
    });

    parentMetaModel.characteristic = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }
}
