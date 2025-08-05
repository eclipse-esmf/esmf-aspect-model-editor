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
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultConstraint, DefaultTrait} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class TraitConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<DefaultTrait> {
  constructor() {
    super();
  }

  public connect(trait: DefaultTrait, source: mxgraph.mxCell) {
    const defaultElement =
      trait.getBaseCharacteristic() == null
        ? this.elementCreator.createEmptyElement(DefaultCharacteristic)
        : this.elementCreator.createEmptyElement(DefaultConstraint);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(defaultElement, {parent: MxGraphHelper.getModelElement(source)}),
    );

    useUpdater(trait).update(defaultElement);
    this.refreshPropertiesLabel(child, defaultElement);

    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.moveCells([child], source.getGeometry().x + 30, source.getGeometry().y + 60);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }
}
