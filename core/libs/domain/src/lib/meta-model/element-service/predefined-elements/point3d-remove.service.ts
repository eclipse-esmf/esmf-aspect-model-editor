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
import {GRAPH_ADAPTER, IGraphAdapter} from '@ame/contracts';
import {ElementRelationUtil} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({providedIn: 'root'})
export class Point3dRemoveService implements PredefinedRemove {
  private readonly modelRootService = inject(ModelRootService);
  private readonly injector = inject(Injector);

  private get graphAdapter(): IGraphAdapter | null {
    return this.injector.get<IGraphAdapter | null>(GRAPH_ADAPTER, null, {optional: true});
  }

  delete(cell: any): boolean {
    const modelElement = ElementRelationUtil.getModelElement(cell);
    if (!this.modelRootService.isPredefined(modelElement)) {
      return false;
    }

    if (
      [PredefinedPropertiesEnum.x, PredefinedPropertiesEnum.y, PredefinedPropertiesEnum.z].includes(
        modelElement.name as PredefinedPropertiesEnum,
      )
    ) {
      const parent = this.graphAdapter
        ?.resolveParents(cell)
        ?.find(p => ElementRelationUtil.getModelElement(p).name === PredefinedEntitiesEnum.Point3d);
      return this.removeTree(parent);
    }

    if (modelElement.name === PredefinedEntitiesEnum.Point3d && modelElement.isPredefined) {
      return this.removeTree(cell);
    }

    return false;
  }

  decouple(edge: any, source: NamedElement): boolean {
    if (!this.modelRootService.isPredefined(source)) {
      return false;
    }

    if (source.name === PredefinedEntitiesEnum.Point3d) {
      return this.removeTree(edge.source);
    }

    return false;
  }

  private removeTree(cell: any): boolean {
    if (!cell) {
      return false;
    }

    for (const edge of this.graphAdapter?.getIncomingEdges(cell) || []) {
      ElementRelationUtil.removeRelation(ElementRelationUtil.getModelElement(edge.source), ElementRelationUtil.getModelElement(cell));
    }

    [cell, ...(this.graphAdapter?.getOutgoingEdges(cell) || []).map(e => e.target)].forEach(c => {
      const modelElement = ElementRelationUtil.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });
    return true;
  }
}
