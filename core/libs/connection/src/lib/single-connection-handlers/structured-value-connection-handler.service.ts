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
import {Injectable, inject} from '@angular/core';
import {DefaultProperty, StructuredValue} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class StructuredValueConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<StructuredValue> {
  private loadedFiles = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  public connect(structuredValue: StructuredValue, source: mxgraph.mxCell) {
    const property = this.elementCreator.createEmptyElement(DefaultProperty);
    structuredValue.elements.push(property);
    structuredValue.deconstructionRule = `${structuredValue.deconstructionRule}(regex)`;
    const child = this.renderTree(property, source);

    this.refreshPropertiesLabel(child, property);
    this.mxGraphService.assignToParent(child, source);
    this.currentCachedFile.resolveInstance(property);

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
