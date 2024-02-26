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

import {DefaultProperty} from '@ame/meta-model';
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
export class PropertyPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements MultiShapeConnector<DefaultProperty, DefaultProperty>
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

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultProperty, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (parentMetaModel.isPredefined()) {
      this.notificationsService.warning({title: this.translate.language.NOTIFICATION_SERVICE.CHILD_FOR_PREDEFINED_ELEMENT_ERROR});
      return;
    }

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
      return;
    }

    if (childMetaModel.extendedElement) {
      this.notificationService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.ILLEGAL_OPERATION_MESSAGE,
        message: this.translate.language.NOTIFICATION_SERVICE.PROPERTY_EXTENSION_CONFLICT,
        timeout: 5000,
      });
      return;
    }

    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }
}
