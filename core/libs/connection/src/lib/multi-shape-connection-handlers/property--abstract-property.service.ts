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

import {DefaultAbstractProperty, DefaultProperty} from '@ame/meta-model';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {MultiShapeConnector, PropertyInheritanceConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';
import {LanguageTranslationService} from '@ame/translation';

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
    protected sammLangService: SammLanguageSettingsService,
    protected translate: LanguageTranslationService,
    private notificationService: NotificationsService,
  ) {
    super(mxGraphService, mxGraphAttributeService, sammLangService, notificationService, translate);
  }

  public connect(
    parentMetaModel: DefaultProperty,
    childMetaModel: DefaultAbstractProperty,
    parentCell: mxgraph.mxCell,
    childCell: mxgraph.mxCell,
  ) {
    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.MISSING_PARENT_ENTITY,
        message: 'The Property need to have as parent an Entity/Abstract Entity',
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
