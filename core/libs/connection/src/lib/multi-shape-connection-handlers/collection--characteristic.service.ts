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

import {DefaultCollection, DefaultCharacteristic, DefaultEntity} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class CollectionCharacteristicConnectionHandler implements MultiShapeConnector<DefaultCollection, DefaultCharacteristic> {
  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
  ) {}

  public connect(parentMetaModel: DefaultCollection, childMetaModel: DefaultCharacteristic, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => {
      if (outEdge.target && !(outEdge.target.getMetaModelElement() instanceof DefaultEntity)) {
        const entity = outEdge.target.getMetaModelElement();
        MxGraphHelper.removeRelation(parentMetaModel, entity);
        this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
      }
    });

    parentMetaModel.elementCharacteristic = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);

    if (parentMetaModel.elementCharacteristic) {
      this.mxGraphService.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    }
  }
}
