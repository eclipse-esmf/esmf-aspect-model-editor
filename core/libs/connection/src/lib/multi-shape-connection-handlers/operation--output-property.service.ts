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

import {MxGraphAttributeService, MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultOperation, DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnectorWithProperty} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OperationPropertyOutputConnectionHandler implements MultiShapeConnectorWithProperty<DefaultOperation, DefaultProperty> {
  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
  ) {}

  public connect(parentMetaModel: DefaultOperation, childMetaModel: DefaultProperty, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    parentMetaModel.output = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
  }
}
