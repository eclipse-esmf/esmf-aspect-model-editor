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

import {FiltersService} from '@ame/loader-filters';
import {EdgeStyles, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultEntityInstance, DefaultEnumeration} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EntityValueConnectionHandler implements SingleShapeConnector<DefaultEntityInstance> {
  constructor(
    private mxGraphService: MxGraphService,
    private filtersService: FiltersService,
  ) {}

  public connect(entityValue: DefaultEntityInstance, source: mxgraph.mxCell) {
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(entityValue, {parent: MxGraphHelper.getModelElement(source)}),
    );

    // connect: EntityValue - Enumeration
    if (MxGraphHelper.getModelElement(source) instanceof DefaultEnumeration) {
      this.mxGraphService.assignToParent(child, source);
    }
    const entityCell = this.mxGraphService.resolveCellByModelElement(entityValue.type);

    // connect: EntityValue - Entity
    this.mxGraphService.assignToParent(entityCell, child, EdgeStyles.entityValueEntityEdge);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
