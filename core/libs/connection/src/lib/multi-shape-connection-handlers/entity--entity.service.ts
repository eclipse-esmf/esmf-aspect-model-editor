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
import {Injectable, inject} from '@angular/core';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {EntityInheritanceConnector, MultiShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EntityEntityConnectionHandler extends EntityInheritanceConnector implements MultiShapeConnector<DefaultEntity, DefaultEntity> {
  private notificationService = inject(NotificationsService);

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.RECURSIVE_ELEMENTS,
        message: this.translate.language.NOTIFICATION_SERVICE.CIRCULAR_CONNECTION_MESSAGE,
        timeout: 5000,
      });
      return;
    }

    super.connectWithAbstract(parentMetaModel, childMetaModel, parentCell, childCell);
    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }
}
