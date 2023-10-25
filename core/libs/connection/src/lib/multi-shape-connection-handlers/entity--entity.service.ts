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

import {FiltersService} from '@ame/loader-filters';
import {DefaultEntity} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {EntityInheritanceConnector, MultiShapeConnector} from '../models';
import {EntityPropertyConnectionHandler} from './entity--property.service';
import {PropertyAbstractPropertyConnectionHandler} from './property--abstract-property.service';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EntityEntityConnectionHandler extends EntityInheritanceConnector implements MultiShapeConnector<DefaultEntity, DefaultEntity> {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector: EntityPropertyConnectionHandler,
    protected filtersService: FiltersService,
    private notificationService: NotificationsService
  ) {
    super(
      mxGraphService,
      mxGraphAttributeService,
      languageSettingsService,
      notificationService,
      filtersService,
      propertyAbstractPropertyConnector,
      entityPropertyConnector
    );
  }

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
      return;
    }

    super.connectWithAbstract(parentMetaModel, childMetaModel, parentCell, childCell);
    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }
}
