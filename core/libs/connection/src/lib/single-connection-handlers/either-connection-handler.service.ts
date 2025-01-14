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
import {ModelElementNamingService} from '@ame/meta-model';
import {ModelInfo, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {ElementCreatorService, NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EitherConnectionHandler implements SingleShapeConnector<DefaultEither> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private notificationsService: NotificationsService,
    private filtersService: FiltersService,
    private elementCreator: ElementCreatorService,
  ) {}

  public connect(either: DefaultEither, source: mxgraph.mxCell, modelInfo: ModelInfo) {
    const defaultCharacteristic = this.elementCreator.createEmptyElement(DefaultCharacteristic);

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
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)}),
    );
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
