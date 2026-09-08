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
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {EntityInheritanceConnector} from '../models/entity-inheritance-connector';
import {MultiShapeConnector} from '../models/shape-connectors.interface';

@Injectable({providedIn: 'root'})
export class AbstractEntityAbstractEntityConnectionHandler
  extends EntityInheritanceConnector
  implements MultiShapeConnector<DefaultEntity, DefaultEntity>
{
  private notificationService = inject(NotificationsService);

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parentCell: Cell, childCell: Cell) {
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
