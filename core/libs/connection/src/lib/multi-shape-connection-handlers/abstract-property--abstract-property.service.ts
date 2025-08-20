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
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector, PropertyInheritanceConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AbstractPropertyAbstractPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements MultiShapeConnector<DefaultProperty, DefaultProperty>
{
  private notificationService = inject(NotificationsService);

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultProperty, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (!parentMetaModel.isAbstract || !childMetaModel.isAbstract) return;

    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.MISSING_PARENT_ENTITY,
        message: this.translate.language.NOTIFICATION_SERVICE.ABSTRACT_PROPERTY_PARENT_REQUIREMENT,
      });
      return;
    }

    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.RECURSIVE_ELEMENTS,
        message: this.translate.language.NOTIFICATION_SERVICE.CIRCULAR_CONNECTION_MESSAGE,
        timeout: 5000,
      });
    } else {
      super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
    }
  }
}
