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
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {ElementCreatorService} from '@ame/shared';
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultConstraint, DefaultTrait} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class TraitConnectionHandler implements SingleShapeConnector<DefaultTrait> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService,
    private elementCreator: ElementCreatorService,
  ) {}

  public connect(trait: DefaultTrait, source: mxgraph.mxCell) {
    const defaultElement =
      trait.getBaseCharacteristic() == null
        ? this.elementCreator.createEmptyElement(DefaultCharacteristic)
        : this.elementCreator.createEmptyElement(DefaultConstraint);
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultElement);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)}),
    );

    useUpdater(trait).update(defaultElement);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.moveCells([child], source.getGeometry().x + 30, source.getGeometry().y + 60);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }
}
