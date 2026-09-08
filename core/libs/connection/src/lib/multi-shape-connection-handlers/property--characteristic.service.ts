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
import {basicShapeGeometry} from '@ame/shared';
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, DefaultProperty, DefaultValue, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class PropertyCharacteristicConnectionHandler implements MultiShapeConnector<DefaultProperty, DefaultCharacteristic> {
  private maxgraphService = inject(MaxGraphService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultCharacteristic, parent: Cell, child: Cell) {
    this.maxgraphAttributeService.graph.getOutgoingEdges(parent, null).forEach((outEdge: Cell) => {
      // Moves the cell being disconnected(arrow removal) in order to prevent overlapping overlays
      if (outEdge.target?.geometry?.x < basicShapeGeometry.expandedWith) {
        outEdge.target.geometry.translate(basicShapeGeometry.expandedWith, 0);
      }

      const targetModel = MaxGraphHelper.getModelElement<NamedElement>(outEdge.target);
      if (targetModel instanceof DefaultProperty || targetModel instanceof DefaultValue) {
        return;
      }

      MaxGraphHelper.removeRelation(parentMetaModel, targetModel);
      this.maxgraphService.removeCells([parent.removeEdge(outEdge, true)]);
    });

    parentMetaModel.characteristic = childMetaModel;
    this.maxgraphService.assignToParent(child, parent);
    this.maxgraphService.formatShapes();
  }
}
