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
import {DefaultEntityInstance, DefaultEnumeration} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class EnumerationEntityValueConnectionHandler implements MultiShapeConnector<DefaultEnumeration, DefaultEntityInstance> {
  private maxgraphService = inject(MaxGraphService);

  connect(parentMetaModel: DefaultEnumeration, childMetaModel: DefaultEntityInstance, parent: Cell, child: Cell): void {
    childMetaModel.addParent(parentMetaModel);
    parentMetaModel.values.push(childMetaModel);

    this.maxgraphService.graph.labelChanged(parent, MaxGraphHelper.createPropertiesLabel(parent), null);
    this.maxgraphService.assignToParent(child, parent);
  }
}
