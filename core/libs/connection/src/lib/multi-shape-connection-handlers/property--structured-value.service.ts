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

import {DefaultProperty, DefaultStructuredValue} from '@ame/meta-model';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';
import {NotificationsService} from '@ame/shared';
import {PropertyCharacteristicConnectionHandler} from './property--characteristic.service';
import {MxGraphHelper} from '@ame/mx-graph';

@Injectable({
  providedIn: 'root',
})
export class PropertyStructuredValueConnectionHandler implements MultiShapeConnector<DefaultProperty, DefaultStructuredValue> {
  constructor(
    private notificationsService: NotificationsService,
    private propertyCharacteristicConnectionHandler: PropertyCharacteristicConnectionHandler,
  ) {}

  connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultStructuredValue, parent: mxgraph.mxCell, child: mxgraph.mxCell): void {
    const isRecursiveConnection = MxGraphHelper.isChildOf(childMetaModel, parentMetaModel);

    if (isRecursiveConnection) {
      return this.notificationsService.warning({
        title: 'Unable to connect elements',
        message: 'StructuredValue can not be recursively connected with Property element',
        timeout: 5000,
      });
    }

    this.propertyCharacteristicConnectionHandler.connect(parentMetaModel, childMetaModel, parent, child);
  }
}
