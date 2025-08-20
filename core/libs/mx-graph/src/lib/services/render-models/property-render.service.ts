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
import {ShapeConnectorService} from '@ame/connection';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class PropertyRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    protected loadedFilesService: LoadedFilesService,
    private shapeConnectorService: ShapeConnectorService,
  ) {
    super(mxGraphService, sammLangService, loadedFilesService);
  }

  update({cell, callback}: RendererUpdatePayload) {
    this.handleExtendsElement(cell);
    this.renderParents(cell);
    super.update({cell, callback});
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultProperty;
  }

  private handleExtendsElement(cell: mxgraph.mxCell) {
    const node = MxGraphHelper.getElementNode<DefaultProperty>(cell);
    const metaModelElement = node.element;
    if (!metaModelElement.exampleValue) {
      return;
    }

    if (!metaModelElement.extends_) return;

    const extendsElement = metaModelElement.extends_;
    const cachedEntity = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.mxGraphService.renderModelElement(
          node.children.find(childNode => childNode.element.aspectModelUrn === extendsElement.aspectModelUrn),
        );
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);
  }
}
