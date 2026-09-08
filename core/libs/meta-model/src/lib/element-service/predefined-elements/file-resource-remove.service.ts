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
import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({providedIn: 'root'})
export class FileResourceRemoveService implements PredefinedRemove {
  private readonly modelRootService = inject(ModelRootService);
  private readonly maxgraphService = inject(MaxGraphService);

  delete(cell: Cell): boolean {
    if (!cell) {
      return false;
    }

    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!this.modelRootService.isPredefined(modelElement)) {
      return false;
    }

    if (['ResourcePath', 'MimeType'].includes(modelElement.name)) {
      return this.delete(this.maxgraphService.resolveParents(cell)?.[0]);
    }

    if ([PredefinedPropertiesEnum.resource, PredefinedPropertiesEnum.mimeType].includes(modelElement.name as PredefinedPropertiesEnum)) {
      const parent = this.maxgraphService
        .resolveParents(cell)
        .find(p => MaxGraphHelper.getModelElement(p).name === PredefinedEntitiesEnum.FileResource);
      return this.removeTree(parent);
    }

    if (modelElement.name === PredefinedEntitiesEnum.FileResource && modelElement.isPredefined) {
      return this.removeTree(cell);
    }

    return false;
  }

  decouple(edge: Cell, source: NamedElement): boolean {
    if ([PredefinedPropertiesEnum.resource, PredefinedPropertiesEnum.mimeType].includes(source.name as PredefinedPropertiesEnum)) {
      const parent = this.maxgraphService
        .resolveParents(edge.source)
        .find(p => MaxGraphHelper.getModelElement(p).name === PredefinedEntitiesEnum.FileResource);
      return this.removeTree(parent);
    }

    if (source.name === PredefinedEntitiesEnum.FileResource) {
      return this.removeTree(edge.source);
    }

    return false;
  }

  private removeTree(cell: Cell): boolean {
    if (!cell) {
      return false;
    }

    const toRemove = [cell];
    const stack = this.maxgraphService.graph.getOutgoingEdges(cell, null).map(edge => edge.target);

    for (const edge of this.maxgraphService.graph.getIncomingEdges(cell, null)) {
      MaxGraphHelper.removeRelation(MaxGraphHelper.getModelElement(edge.source), MaxGraphHelper.getModelElement(cell));
    }

    while (stack.length) {
      const lastCell = stack.pop();
      stack.push(...this.maxgraphService.graph.getOutgoingEdges(lastCell, null).map(edge => edge.target));
      toRemove.push(lastCell);
    }

    toRemove.forEach(c => {
      const modelElement = MaxGraphHelper.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });

    return true;
  }
}
