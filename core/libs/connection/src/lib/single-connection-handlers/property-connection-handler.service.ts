/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {FiltersService} from '@ame/loader-filters';
import {Property, ModelElementNamingService, DefaultCharacteristic} from '@ame/meta-model';
import {MxGraphService, MxGraphShapeOverlayService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class PropertyConnectionHandler implements SingleShapeConnector<Property> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private filtersService: FiltersService
  ) {}

  public connect(property: Property, source: mxgraph.mxCell) {
    if (property.characteristic) {
      return;
    }

    property.characteristic = DefaultCharacteristic.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(property.characteristic);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    property.characteristic = metaModelElement;
    this.mxGraphService.assignToParent(child, source);

    if (MxGraphHelper.hasGrandParentStructuredValue(child, this.mxGraphService.graph)) {
      this.mxGraphShapeOverlayService.removeOverlay(child, MxGraphHelper.getNewShapeOverlayButton(child));
    }

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
