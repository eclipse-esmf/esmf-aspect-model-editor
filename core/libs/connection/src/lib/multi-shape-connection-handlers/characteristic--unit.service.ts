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

import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, DefaultQuantifiable, DefaultUnit} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class CharacteristicUnitConnectionHandler implements MultiShapeConnector<DefaultCharacteristic, DefaultUnit> {
  private maxgraphService = inject(MaxGraphService);

  public connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultUnit, parent: Cell, child: Cell) {
    if (!(parentMetaModel instanceof DefaultQuantifiable)) {
      return;
    }

    if (parentMetaModel.unit && parentMetaModel.unit !== childMetaModel) {
      const obsoleteEdge = this.maxgraphService.graph
        .getOutgoingEdges(parent, null)
        .find(edge => MaxGraphHelper.getModelElement(edge.target) instanceof DefaultUnit);

      const unit = MaxGraphHelper.getModelElement<DefaultUnit>(obsoleteEdge.target);
      MaxGraphHelper.removeRelation(parentMetaModel, unit);

      if (unit.isPredefined) {
        this.maxgraphService.removeCells([obsoleteEdge.target], true);
      } else {
        this.maxgraphService.removeCells([obsoleteEdge]);
      }
    }
    parentMetaModel.unit = childMetaModel;
    this.maxgraphService.assignToParent(child, parent);
  }
}
