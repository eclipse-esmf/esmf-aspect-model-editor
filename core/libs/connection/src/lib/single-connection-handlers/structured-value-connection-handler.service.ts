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

import {LoadedFilesService} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {ModelElementNamingService} from '@ame/meta-model';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {ElementCreatorService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultProperty, StructuredValue} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class StructuredValueConnectionHandler implements SingleShapeConnector<StructuredValue> {
  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService,
    private loadedFiles: LoadedFilesService,
    private elementCreator: ElementCreatorService,
  ) {}

  public connect(structuredValue: StructuredValue, source: mxgraph.mxCell) {
    const property = this.elementCreator.createEmptyElement(DefaultProperty);
    structuredValue.elements.push(property);
    structuredValue.deconstructionRule = `${structuredValue.deconstructionRule}(regex)`;
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(property);
    const propertyCell = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)}),
    );
    this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
    this.mxGraphService.assignToParent(propertyCell, source);
    this.currentCachedFile.resolveInstance(property);

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
