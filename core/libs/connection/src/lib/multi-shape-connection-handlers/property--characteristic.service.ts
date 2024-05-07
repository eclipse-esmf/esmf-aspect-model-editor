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

import {DefaultProperty, DefaultCharacteristic, DefaultAbstractProperty} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {basicShapeGeometry} from '@ame/shared';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class PropertyCharacteristicConnectionHandler implements MultiShapeConnector<DefaultProperty, DefaultCharacteristic> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultCharacteristic, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach((outEdge: mxgraph.mxCell) => {
      // moves the cell being disconnected(arrow removal) in order to prevent overlapping overlays
      if (outEdge.target?.geometry?.x < basicShapeGeometry.expandedWith) {
        outEdge.target.geometry.translate(basicShapeGeometry.expandedWith, 0);
      }

      const targetModel = MxGraphHelper.getModelElement(outEdge.target);
      if (targetModel instanceof DefaultProperty || targetModel instanceof DefaultAbstractProperty) {
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
