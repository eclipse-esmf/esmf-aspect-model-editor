/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {PredefinedEntities, PredefinedProperties} from '@ame/vocabulary';
import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement} from '../../aspect-meta-model';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({
  providedIn: 'root',
})
export class Point3dRemoveService implements PredefinedRemove {
  constructor(private modelRootService: ModelRootService, private mxGraphService: MxGraphService) {}

  delete(cell: mxgraph.mxCell): boolean {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!this.modelRootService.isPredefined(modelElement)) {
      return false;
    }

    if ([PredefinedProperties.x, PredefinedProperties.y, PredefinedProperties.z].includes(modelElement.name as PredefinedProperties)) {
      const parent = this.mxGraphService
        .resolveParents(cell)
        .find(p => MxGraphHelper.getModelElement(p).name === PredefinedEntities.Point3d);
      return this.removeTree(parent);
    }

    if (modelElement.name === PredefinedEntities.Point3d) {
      return this.removeTree(cell);
    }

    return false;
  }

  decouple(edge: mxgraph.mxCell, source: BaseMetaModelElement): boolean {
    if (!this.modelRootService.isPredefined(source)) {
      return false;
    }

    if (source.name === PredefinedEntities.Point3d) {
      return this.removeTree(edge.source);
    }

    return false;
  }

  private removeTree(cell: mxgraph.mxCell): boolean {
    if (!cell) {
      return false;
    }

    [cell, ...this.mxGraphService.graph.getOutgoingEdges(cell).map(e => e.target)].forEach(c => {
      const modelElement = MxGraphHelper.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });
    return true;
  }
}
