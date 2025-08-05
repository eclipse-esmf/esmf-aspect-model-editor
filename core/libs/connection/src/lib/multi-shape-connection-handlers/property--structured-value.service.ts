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

import {MxGraphHelper} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';
import {PropertyCharacteristicConnectionHandler} from './property--characteristic.service';

@Injectable({
  providedIn: 'root',
})
export class PropertyStructuredValueConnectionHandler implements MultiShapeConnector<DefaultProperty, DefaultStructuredValue> {
  private notificationsService = inject(NotificationsService);
  private propertyCharacteristicConnectionHandler = inject(PropertyCharacteristicConnectionHandler);

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
