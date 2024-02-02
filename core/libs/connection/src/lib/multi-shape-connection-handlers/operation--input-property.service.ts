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

import {DefaultOperation, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnectorWithProperty} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class OperationPropertyInputConnectionHandler implements MultiShapeConnectorWithProperty<DefaultOperation, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultOperation, childMetaModel: DefaultProperty, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    const isInputAlreadyDefined = parentMetaModel.input.some(value => value.property.aspectModelUrn === childMetaModel.aspectModelUrn);
    if (!isInputAlreadyDefined) {
      parentMetaModel.input.push({property: childMetaModel, keys: {}});
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
