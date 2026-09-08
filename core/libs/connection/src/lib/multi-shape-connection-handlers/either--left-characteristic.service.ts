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

import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class EitherCharacteristicLeftConnectionHandler implements MultiShapeConnector<DefaultEither, DefaultCharacteristic> {
  private maxgraphService = inject(MaxGraphService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  public connect(parentMetaModel: DefaultEither, childMetaModel: DefaultCharacteristic, parent: Cell, child: Cell) {
    parentMetaModel.left = childMetaModel;
    this.maxgraphAttributeService.graph.getOutgoingEdges(parent, null).forEach(outEdge => {
      const targetModel = MaxGraphHelper.getModelElement(outEdge?.target);
      if (outEdge.target && targetModel?.aspectModelUrn === parentMetaModel.left?.aspectModelUrn) {
        MaxGraphHelper.removeRelation(parentMetaModel, parentMetaModel.left);
        this.maxgraphService.removeCells([parent.removeEdge(outEdge, true)]);
      }
    });

    this.maxgraphService.assignToParent(child, parent);
    this.maxgraphService.formatShapes();
  }
}
