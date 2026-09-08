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

import {MaxGraphHelper} from '@ame/max-graph';
import {NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';
import {PropertyCharacteristicConnectionHandler} from './property--characteristic.service';

@Injectable({providedIn: 'root'})
export class PropertyStructuredValueConnectionHandler implements MultiShapeConnector<DefaultProperty, DefaultStructuredValue> {
  private notificationsService = inject(NotificationsService);
  private propertyCharacteristicConnectionHandler = inject(PropertyCharacteristicConnectionHandler);

  connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultStructuredValue, parent: Cell, child: Cell): void {
    const isRecursiveConnection = MaxGraphHelper.isChildOf(childMetaModel, parentMetaModel);

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
