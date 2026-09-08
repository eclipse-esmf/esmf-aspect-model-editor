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
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, DefaultState} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper} from '../../helpers';
import {EdgeStyles, RendererUpdatePayload} from '../../models';
import {MaxGraphShapeOverlayService} from '../max-graph-shape-overlay.service';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class EntityValueRenderService extends BaseRenderService {
  private readonly filtersService = inject(FiltersService);
  private readonly maxgraphShapeOverlay = inject(MaxGraphShapeOverlayService);
  private readonly shapeConnectorService = inject(ShapeConnectorService);

  isApplicable(cell: Cell): boolean {
    return MaxGraphHelper.getModelElement(cell) instanceof DefaultEntityInstance;
  }

  update({cell}: RendererUpdatePayload) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntityInstance>(cell);

    this.removeChildrenEntityValuesIfNecessary(cell);

    for (const [, value] of modelElement.getTuples() || []) {
      if (!(value instanceof DefaultEntityInstance)) {
        continue;
      }

      if (this.isChildOf(cell, value)) {
        continue;
      }

      this.connectEntityValues(modelElement, value);
    }

    super.update({cell});
  }

  create(modelElement: DefaultEntityInstance, parent: Cell) {
    this.shapeConnectorService.createAndConnectShape(modelElement, parent);
    this.maxgraphShapeOverlay.removeOverlaysByConnection(modelElement, parent);

    const parentModelElement = MaxGraphHelper.getModelElement<DefaultEnumeration>(parent);
    MaxGraphHelper.establishRelation(parentModelElement, modelElement);
    MaxGraphHelper.establishRelation(modelElement, parentModelElement.dataType as DefaultEntity);
    if (parentModelElement.dataType instanceof DefaultEntity) {
      this.connectEntityValueWithChildren(modelElement);
    }
  }

  delete(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntityInstance>(cell);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    this.updateEnumeration(modelElement, incomingEdges);
    this.maxgraphService.updateEnumerationsWithEntityValue(modelElement);
    this.maxgraphService.updateEntityValuesWithReference(modelElement);
    this.maxgraphService.removeCells([cell]);
  }

  private updateEnumeration(entityValue: DefaultEntityInstance, incomingEdges: Array<Cell>) {
    const edge = incomingEdges.find(incomingEdge => MaxGraphHelper.getModelElement(incomingEdge?.source) instanceof DefaultEnumeration);
    const metaModelElement = MaxGraphHelper.getModelElement(edge?.source);

    if (!(metaModelElement instanceof DefaultEnumeration)) {
      return;
    }

    const entityValueIndex = metaModelElement.values.indexOf(entityValue);
    if (entityValueIndex >= 0) {
      metaModelElement.values.splice(entityValueIndex, 1);
    }
  }

  deleteByModel(modelElement: DefaultEntityInstance) {
    const modelCell = this.maxgraphService
      .getAllCells()
      .find(cell => MaxGraphHelper.getModelElement(cell).aspectModelUrn === modelElement.aspectModelUrn);

    if (!modelCell) {
      return;
    }

    this.delete(modelCell);
  }

  private connectEntityValueWithChildren(modelElement: DefaultEntityInstance) {
    const entityInstances = Array.from(modelElement.assertions.values()).flat();
    for (const property of entityInstances) {
      if (!(property instanceof DefaultEntityInstance)) {
        continue;
      }

      this.connectEntityValues(modelElement, property);
      this.connectEntityValueWithChildren(property);
    }
  }

  private isChildOf(parent: Cell, child: DefaultEntityInstance) {
    return this.maxgraphService.graph
      .getOutgoingEdges(parent, null)
      .find(edge => MaxGraphHelper.getModelElement(edge.target).aspectModelUrn === child?.aspectModelUrn);
  }

  private connectEntityValues(parent: DefaultEntityInstance, child: DefaultEntityInstance) {
    const inGraph = this.inMaxgraph(child);

    if (!inGraph) {
      // Render ChildEntityValue
      this.maxgraphService.renderModelElement(this.filtersService.createNode(child, {parent}));

      // Connect ChildEntityValue with its entity
      this.maxgraphService.assignToParent(
        this.maxgraphService.resolveCellByModelElement(child.type),
        this.maxgraphService.resolveCellByModelElement(child),
        EdgeStyles.entityValueEntityEdge,
      );
    }

    // Connect EntityValue with ChildEntityValue
    this.maxgraphService.assignToParent(
      this.maxgraphService.resolveCellByModelElement(child),
      this.maxgraphService.resolveCellByModelElement(parent),
      EdgeStyles.entityValueEntityEdge,
    );
  }

  private removeChildrenEntityValuesIfNecessary(cell: Cell) {
    const children = this.maxgraphService.graph.getOutgoingEdges(cell, null);
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntityInstance>(cell);

    if (!children.length) {
      return;
    }

    children
      .map(edge => edge.target)
      .filter(child => child && child.id !== cell.id && MaxGraphHelper.getModelElement(child) instanceof DefaultEntityInstance)
      .forEach(child => {
        const connectingEdge: Cell = this.maxgraphService.graph.getIncomingEdges(child, null).find(edge => edge?.source == cell);
        const isLinkedToOtherEntityValues = this.maxgraphService.graph.getOutgoingEdges(child, null).some(edge => {
          if (!edge?.source) {
            return false;
          }

          const parentModelElement = MaxGraphHelper.getModelElement(edge.source);
          if (
            !(parentModelElement instanceof DefaultEntityInstance) ||
            !(parentModelElement instanceof DefaultEnumeration) ||
            !(parentModelElement instanceof DefaultState)
          ) {
            return false;
          }

          return parentModelElement.aspectModelUrn !== modelElement.aspectModelUrn;
        });
        const childModelElement = MaxGraphHelper.getModelElement(child);
        const entityValues: DefaultEntityInstance[] = modelElement.getValues<DefaultEntityInstance[]>();
        const isPartOfTheModel = entityValues.some(entityValue => entityValue.aspectModelUrn === childModelElement.aspectModelUrn);
        if (!isLinkedToOtherEntityValues && !childModelElement.parents?.length && !isPartOfTheModel) {
          this.delete(child);
        } else if (!isLinkedToOtherEntityValues && childModelElement.parents?.length > 0 && !isPartOfTheModel && connectingEdge) {
          this.maxgraphService.removeCells([connectingEdge]);
        }
      });
  }
}
