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

import {MxGraphHelper, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, Property} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PropertyConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Property> {
  private mxGraphShapeOverlayService = inject(MxGraphShapeOverlayService);

  public connect(property: Property, source: mxgraph.mxCell) {
    if (property.characteristic) {
      return;
    }

    property.characteristic = this.elementCreator.createEmptyElement(DefaultCharacteristic);
    const child = this.renderTree(property.characteristic, source);
    this.mxGraphService.assignToParent(child, source);

    if (MxGraphHelper.hasGrandParentStructuredValue(child, this.mxGraphService.graph)) {
      this.mxGraphShapeOverlayService.removeOverlay(child, MxGraphHelper.getNewShapeOverlayButton(child));
    }

    this.refreshPropertiesLabel(child, property.characteristic);

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
