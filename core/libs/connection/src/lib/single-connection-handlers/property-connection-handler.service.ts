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

import {MaxGraphHelper, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, Property} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class PropertyConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Property> {
  private maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);

  public connect(property: Property, source: Cell) {
    if (property.characteristic) {
      return;
    }

    property.characteristic = this.elementCreator.createEmptyElement(DefaultCharacteristic);
    const child = this.renderTree(property.characteristic, source);
    this.maxgraphService.assignToParent(child, source);

    if (MaxGraphHelper.hasGrandParentStructuredValue(child, this.maxgraphService.graph)) {
      this.maxgraphShapeOverlayService.removeOverlay(child, MaxGraphHelper.getNewShapeOverlayButton(child));
    }

    this.refreshPropertiesLabel(child, property.characteristic);

    this.maxgraphService.formatCell(source);
    this.maxgraphService.formatShapes();
  }
}
