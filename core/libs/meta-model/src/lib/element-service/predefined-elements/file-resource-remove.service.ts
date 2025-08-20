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
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({
  providedIn: 'root',
})
export class FileResourceRemoveService implements PredefinedRemove {
  constructor(
    private modelRootService: ModelRootService,
    private mxGraphService: MxGraphService,
  ) {}

  delete(cell: mxgraph.mxCell): boolean {
    if (!cell) {
      return false;
    }

    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!this.modelRootService.isPredefined(modelElement)) {
      return false;
    }

    if (['ResourcePath', 'MimeType'].includes(modelElement.name)) {
      return this.delete(this.mxGraphService.resolveParents(cell)?.[0]);
    }

    if ([PredefinedPropertiesEnum.resource, PredefinedPropertiesEnum.mimeType].includes(modelElement.name as PredefinedPropertiesEnum)) {
      const parent = this.mxGraphService
        .resolveParents(cell)
        .find(p => MxGraphHelper.getModelElement(p).name === PredefinedEntitiesEnum.FileResource);
      return this.removeTree(parent);
    }

    if (modelElement.name === PredefinedEntitiesEnum.FileResource && modelElement.isPredefined) {
      return this.removeTree(cell);
    }

    return false;
  }

  decouple(edge: mxgraph.mxCell, source: NamedElement): boolean {
    if ([PredefinedPropertiesEnum.resource, PredefinedPropertiesEnum.mimeType].includes(source.name as PredefinedPropertiesEnum)) {
      const parent = this.mxGraphService
        .resolveParents(edge.source)
        .find(p => MxGraphHelper.getModelElement(p).name === PredefinedEntitiesEnum.FileResource);
      return this.removeTree(parent);
    }

    if (source.name === PredefinedEntitiesEnum.FileResource) {
      return this.removeTree(edge.source);
    }

    return false;
  }

  private removeTree(cell: mxgraph.mxCell): boolean {
    if (!cell) {
      return false;
    }

    const toRemove = [cell];
    const stack = this.mxGraphService.graph.getOutgoingEdges(cell).map(edge => edge.target);

    for (const edge of this.mxGraphService.graph.getIncomingEdges(cell)) {
      MxGraphHelper.removeRelation(MxGraphHelper.getModelElement(edge.source), MxGraphHelper.getModelElement(cell));
    }

    while (stack.length) {
      const lastCell = stack.pop();
      stack.push(...this.mxGraphService.graph.getOutgoingEdges(lastCell).map(edge => edge.target));
      toRemove.push(lastCell);
    }

    toRemove.forEach(c => {
      const modelElement = MxGraphHelper.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });

    return true;
  }
}
