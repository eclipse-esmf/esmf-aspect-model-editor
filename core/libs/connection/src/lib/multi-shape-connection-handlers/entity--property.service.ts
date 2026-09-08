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

import {EntityInstanceService} from '@ame/editor';
import {MaxGraphService} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class EntityPropertyConnectionHandler implements MultiShapeConnector<DefaultEntity, DefaultProperty> {
  private maxgraphService = inject(MaxGraphService);
  private entityInstanceService = inject(EntityInstanceService);

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultProperty, parentCell: Cell, childCell: Cell) {
    if (!parentMetaModel.properties.find(property => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      parentMetaModel.properties.push(childMetaModel);
      this.entityInstanceService.onNewProperty(childMetaModel, parentMetaModel);
    }
    this.maxgraphService.assignToParent(childCell, parentCell);
  }
}
