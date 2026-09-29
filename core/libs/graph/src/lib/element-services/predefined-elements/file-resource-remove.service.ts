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
import {ElementRelationUtil} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({providedIn: 'root'})
export class FileResourceRemoveService implements PredefinedRemove {
  private readonly modelRootService = inject(ModelRootService);
  private readonly injector = inject(Injector);

  private get graphAdapter(): GraphAdapterPort | null {
    return this.injector.get<GraphAdapterPort | null>(GraphAdapterPort, null, {optional: true});
  }

  delete(cell: any): boolean {
    if (!cell) {
      return false;
    }

    const modelElement = ElementRelationUtil.getModelElement(cell);
    if (!this.modelRootService.isPredefined(modelElement)) {
      return false;
    }

    if (['ResourcePath', 'MimeType'].includes(modelElement.name)) {
      return this.delete(this.graphAdapter?.resolveParents(cell)?.[0]);
    }

    if ([PredefinedPropertiesEnum.resource, PredefinedPropertiesEnum.mimeType].includes(modelElement.name as PredefinedPropertiesEnum)) {
      const parent = this.graphAdapter
        ?.resolveParents(cell)
        ?.find(p => ElementRelationUtil.getModelElement(p).name === PredefinedEntitiesEnum.FileResource);
      return this.removeTree(parent);
    }

    if (modelElement.name === PredefinedEntitiesEnum.FileResource && modelElement.isPredefined) {
      return this.removeTree(cell);
    }

    return false;
  }

  decouple(edge: any, source: NamedElement): boolean {
    if ([PredefinedPropertiesEnum.resource, PredefinedPropertiesEnum.mimeType].includes(source.name as PredefinedPropertiesEnum)) {
      const parent = this.graphAdapter
        ?.resolveParents(edge.source)
        ?.find(p => ElementRelationUtil.getModelElement(p).name === PredefinedEntitiesEnum.FileResource);
      return this.removeTree(parent);
    }

    if (source.name === PredefinedEntitiesEnum.FileResource) {
      return this.removeTree(edge.source);
    }

    return false;
  }

  private removeTree(cell: any): boolean {
    if (!cell) {
      return false;
    }

    const toRemove = [cell];
    const stack = (this.graphAdapter?.getOutgoingEdges(cell) || []).map(edge => edge.target);

    for (const edge of this.graphAdapter?.getIncomingEdges(cell) || []) {
      ElementRelationUtil.removeRelation(ElementRelationUtil.getModelElement(edge.source), ElementRelationUtil.getModelElement(cell));
    }

    while (stack.length) {
      const lastCell = stack.pop();
      stack.push(...(this.graphAdapter?.getOutgoingEdges(lastCell) || []).map(edge => edge.target));
      toRemove.push(lastCell);
    }

    toRemove.forEach(c => {
      const modelElement = ElementRelationUtil.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });

    return true;
  }
}
