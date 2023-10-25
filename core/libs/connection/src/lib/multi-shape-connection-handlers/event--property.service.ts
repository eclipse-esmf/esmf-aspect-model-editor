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

import {DefaultEvent, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EventPropertyConnectionHandler implements MultiShapeConnector<DefaultEvent, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultEvent, childMetaModel: DefaultProperty, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    if (!parentMetaModel.parameters.find(param => param.property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      parentMetaModel.parameters.push({property: childMetaModel, keys: {}});
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
