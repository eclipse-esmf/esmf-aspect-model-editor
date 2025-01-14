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

import {FiltersService} from '@ame/loader-filters';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable} from '@angular/core';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {EntityInheritanceConnector, MultiShapeConnector} from '../models';
import {EntityPropertyConnectionHandler} from './entity--property.service';
import {PropertyAbstractPropertyConnectionHandler} from './property--abstract-property.service';

@Injectable({
  providedIn: 'root',
})
export class EntityAbstractEntityConnectionHandler
  extends EntityInheritanceConnector
  implements MultiShapeConnector<DefaultEntity, DefaultEntity>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected sammLangService: SammLanguageSettingsService,
    protected propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector: EntityPropertyConnectionHandler,
    protected filtersService: FiltersService,
    protected translate: LanguageTranslationService,
    private notificationService: NotificationsService,
  ) {
    super(
      mxGraphService,
      mxGraphAttributeService,
      sammLangService,
      notificationService,
      filtersService,
      translate,
      propertyAbstractPropertyConnector,
      entityPropertyConnector,
    );
  }

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parent: mxgraph.mxCell, child: mxgraph.mxCell): void {
    if (MxGraphHelper.isEntityCycleInheritance(child, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.RECURSIVE_ELEMENTS,
        message: this.translate.language.NOTIFICATION_SERVICE.CIRCULAR_CONNECTION_MESSAGE,
        timeout: 5000,
      });
      return;
    }

    super.connectWithAbstract(parentMetaModel, childMetaModel, parent, child);
    super.connect(parentMetaModel, childMetaModel, parent, child);
  }
}
