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
import {DefaultAbstractEntity, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root'
})
export class AbstractEntityPropertyConnectionHandler implements MultiShapeConnector<DefaultAbstractEntity, DefaultProperty> {
  constructor(
    private mxGraphService: MxGraphService,
    private entityInstanceService: EntityInstanceService
  ) {}

  public connect(
    parentMetaModel: DefaultAbstractEntity,
    childMetaModel: DefaultProperty,
    parentCell: mxgraph.mxCell,
    childCell: mxgraph.mxCell
  ) {
    if (!parentMetaModel.properties.find(({property}) => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty);
      this.entityInstanceService.onNewProperty(overWrittenProperty, parentMetaModel);
    }
    this.mxGraphService.assignToParent(childCell, parentCell);
  }
}
