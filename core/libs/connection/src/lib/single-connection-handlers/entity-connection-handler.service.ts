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

import {EntityInstanceService} from '@ame/editor';
import {Injectable} from '@angular/core';
import {DefaultProperty, Entity} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EntityConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Entity> {
  constructor(private entityInstanceService: EntityInstanceService) {
    super();
  }

  public connect(entity: Entity, source: mxgraph.mxCell) {
    const defaultProperty = this.elementCreator.createEmptyElement(DefaultProperty);
    const child = this.renderTree(defaultProperty, source);
    this.refreshPropertiesLabel(child, defaultProperty);

    entity.properties.push(defaultProperty);
    this.mxGraphService.assignToParent(child, source);
    this.entityInstanceService.onNewProperty(defaultProperty, entity);
    this.mxGraphService.formatCell(source, true);
  }
}
