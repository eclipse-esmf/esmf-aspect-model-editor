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

import {DefaultAspect, DefaultEvent} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class AspectEventConnectionHandler implements MultiShapeConnector<DefaultAspect, DefaultEvent> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultAspect, childMetaModel: DefaultEvent, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    if (!parentMetaModel.events.find(operation => operation === childMetaModel)) {
      parentMetaModel.events.push(childMetaModel);
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
