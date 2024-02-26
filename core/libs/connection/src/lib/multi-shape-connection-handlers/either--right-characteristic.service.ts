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

import {DefaultEither, DefaultCharacteristic} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EitherCharacteristicRightConnectionHandler implements MultiShapeConnector<DefaultEither, DefaultCharacteristic> {
  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
  ) {}

  public connect(parentMetaModel: DefaultEither, childMetaModel: DefaultCharacteristic, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    parentMetaModel.right = childMetaModel;
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => {
      const targetModel = MxGraphHelper.getModelElement(outEdge.target);
      if (outEdge.target && targetModel?.aspectModelUrn === parentMetaModel.right?.aspectModelUrn) {
        MxGraphHelper.removeRelation(parentMetaModel, parentMetaModel.right);
        this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
      }
    });

    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }
}
