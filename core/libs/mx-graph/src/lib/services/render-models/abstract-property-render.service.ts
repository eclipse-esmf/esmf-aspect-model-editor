/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {Injectable, inject} from '@angular/core';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class AbstractPropertyRenderService extends BaseRenderService {
  private filtersService = inject(FiltersService);
  private shapeConnectorService = inject(ShapeConnectorService);

  update({cell, callback}: RendererUpdatePayload) {
    this.handleExtendsElement(cell);
    this.renderParents(cell);

    super.update({cell, callback});
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    const element = MxGraphHelper.getModelElement(cell);
    return element instanceof DefaultProperty && element.isAbstract;
  }

  private handleExtendsElement(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultProperty>(cell);
    if (!metaModelElement.extends_) {
      return;
    }

    const extendsElement = metaModelElement.extends_ as DefaultProperty;
    const cachedEntity = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.mxGraphService.renderModelElement(this.filtersService.createNode(extendsElement, {parent: metaModelElement}));
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);
  }
}
