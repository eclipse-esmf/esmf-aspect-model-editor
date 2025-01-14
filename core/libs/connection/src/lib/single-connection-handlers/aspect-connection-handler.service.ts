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
import {MxGraphService} from '@ame/mx-graph';
import {ElementCreatorService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {Aspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AspectConnectionHandler implements SingleShapeConnector<Aspect> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService,
    private elementCreator: ElementCreatorService,
  ) {}

  public connect(aspect: Aspect, source: mxgraph.mxCell) {
    const defaultProperty = this.elementCreator.createEmptyElement(DefaultProperty);
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(this.filtersService.createNode(metaModelElement, {parent: aspect}));
    aspect.properties.push(defaultProperty);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
