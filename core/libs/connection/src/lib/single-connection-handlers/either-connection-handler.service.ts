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
import {DefaultEither, ModelElementNamingService, DefaultCharacteristic} from '@ame/meta-model';
import {MxGraphService, ModelInfo, MxGraphHelper} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root'
})
export class EitherConnectionHandler implements SingleShapeConnector<DefaultEither> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private notificationsService: NotificationsService,
    private filtersService: FiltersService
  ) {}

  public connect(either: DefaultEither, source: mxgraph.mxCell, modelInfo: ModelInfo) {
    const defaultCharacteristic = DefaultCharacteristic.createInstance();

    if (ModelInfo.IS_EITHER_LEFT === modelInfo) {
      if (either.left) {
        this.notificationsService.warning({title: 'Either left is already defined'});
        return;
      }
      either.left = defaultCharacteristic;
    } else if (ModelInfo.IS_EITHER_RIGHT === modelInfo) {
      if (either.right) {
        this.notificationsService.warning({title: 'Either right is already defined'});
        return;
      }
      either.right = defaultCharacteristic;
    }

    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultCharacteristic);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
