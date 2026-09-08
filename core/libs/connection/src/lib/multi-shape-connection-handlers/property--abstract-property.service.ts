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
import {Injectable, inject} from '@angular/core';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {PropertyInheritanceConnector} from '../models/property-inheritance-connector';
import {MultiShapeConnector} from '../models/shape-connectors.interface';

@Injectable({providedIn: 'root'})
export class PropertyAbstractPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements MultiShapeConnector<DefaultProperty, DefaultProperty>
{
  private notificationService = inject(NotificationsService);

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultProperty, parentCell: Cell, childCell: Cell) {
    if (!childMetaModel.isAbstract) return;

    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: this.translate.language.notificationService.missingParentEntity,
        message: 'The Property need to have as parent an Entity/Abstract Entity',
      });
      return;
    }

    if (MaxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.maxgraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.notificationService.recursiveElements,
        message: this.translate.language.notificationService.circularConnectionMessage,
        timeout: 5000,
      });
    } else {
      super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
    }
  }
}
