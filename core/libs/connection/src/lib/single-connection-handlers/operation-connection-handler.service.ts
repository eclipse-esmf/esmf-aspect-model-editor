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

import {ModelInfo} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultProperty, Operation} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OperationConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Operation> {
  constructor(private notificationsService: NotificationsService) {
    super();
  }

  public connect(operation: Operation, source: mxgraph.mxCell, modelInfo: ModelInfo) {
    const defaultProperty = this.elementCreator.createEmptyElement(DefaultProperty);

    if (ModelInfo.IS_OPERATION_OUTPUT === modelInfo) {
      if (operation.output) {
        this.notificationsService.warning({title: 'Operation output is already defined'});
        return;
      }
      operation.output = defaultProperty;
    } else if (ModelInfo.IS_OPERATION_INPUT === modelInfo) {
      operation.input.push(defaultProperty);
    }

    const child = this.renderTree(defaultProperty, source);
    this.refreshPropertiesLabel(child, defaultProperty);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
