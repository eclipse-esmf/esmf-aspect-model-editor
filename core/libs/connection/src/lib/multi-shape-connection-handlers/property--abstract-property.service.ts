/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {DefaultProperty, DefaultAbstractProperty} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {PropertyInheritanceConnector, MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class PropertyAbstractPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements MultiShapeConnector<DefaultProperty, DefaultAbstractProperty>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    private notificationService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationService);
  }

  public connect(
    parentMetaModel: DefaultProperty,
    childMetaModel: DefaultAbstractProperty,
    parentCell: mxgraph.mxCell,
    childCell: mxgraph.mxCell
  ) {
    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: 'No entity as parent present',
        message: 'The Property need to have as parent an Entity/Abstract Entity',
      });
      return;
    }

    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
    } else {
      super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
    }
  }
}
