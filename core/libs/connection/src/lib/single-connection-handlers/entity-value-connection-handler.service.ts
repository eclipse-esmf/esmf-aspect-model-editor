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

import {FiltersService} from '@ame/loader-filters';
import {EdgeStyles, MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {DefaultEntityInstance, DefaultEnumeration} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {SingleShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class EntityValueConnectionHandler implements SingleShapeConnector<DefaultEntityInstance> {
  private maxgraphService = inject(MaxGraphService);
  private filtersService = inject(FiltersService);

  public connect(entityValue: DefaultEntityInstance, source: Cell) {
    const child = this.maxgraphService.renderModelElement(
      this.filtersService.createNode(entityValue, {parent: MaxGraphHelper.getModelElement(source)}),
    );

    // connect: EntityValue - Enumeration
    if (MaxGraphHelper.getModelElement(source) instanceof DefaultEnumeration) {
      this.maxgraphService.assignToParent(child, source);
    }
    const entityCell = this.maxgraphService.resolveCellByModelElement(entityValue.type);

    // connect: EntityValue - Entity
    this.maxgraphService.assignToParent(entityCell, child, EdgeStyles.entityValueEntityEdge);
    this.maxgraphService.formatCell(source);
    this.maxgraphService.formatShapes();
  }
}
