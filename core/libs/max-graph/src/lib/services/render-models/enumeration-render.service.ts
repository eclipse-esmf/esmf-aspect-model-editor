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
import {
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  DefaultValue,
  ScalarValue,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper} from '../../helpers';
import {MaxGraphShapeOverlayService} from '../max-graph-shape-overlay.service';
import {BaseRenderService} from './base-render-service';
import {EntityValueRenderService} from './entity-value-render.service';
import {UnitRenderService} from './unit-render.service';

interface EnumerationForm {
  chipList: DefaultEntityInstance[];
  deletedEntityValues: DefaultEntityInstance[];

  [key: string]: any;
}

@Injectable({providedIn: 'root'})
export class EnumerationRenderService extends BaseRenderService {
  private readonly filtersService = inject(FiltersService);
  private readonly shapeConnectorService = inject(ShapeConnectorService);
  private readonly entityValueRenderer = inject(EntityValueRenderService);
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly unitRendererService = inject(UnitRenderService);

  isApplicable(cell: Cell): boolean {
    return MaxGraphHelper.getModelElement(cell) instanceof DefaultEnumeration;
  }

  update({cell, form}) {
    const metaModelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    this.handleBottomOverlay(cell);
    if (form.newDataType) {
      this.handleNewDataType(cell, form.newDataType);
    } else if (metaModelElement.dataType instanceof DefaultEntity) {
      this.handleEntityDataType(cell, metaModelElement.dataType);
    } else {
      this.removeFloatingEntityValues(cell);
    }

    this.handleValues(cell, form.enumValues || []);
    this.handleComplexValues(cell, form);
    this.removeElementCharacteristic(cell);
    this.unitRendererService.removeFrom(cell);
    this.removeStructuredValueProperties(cell);
    super.update({cell, form});
  }

  private handleValues(cell: Cell, valuesList: (ScalarValue | DefaultValue)[]) {
    if (valuesList.some(value => value instanceof DefaultEntityInstance)) return;

    const existentValues = (
      this.maxgraphService.graph
        .getOutgoingEdges(cell, null)
        ?.map(edge => ({edge, modelElement: MaxGraphHelper.getModelElement<DefaultValue>(edge.target)})) || []
    ).reduce(
      (acc, curr) => {
        acc[curr.modelElement.aspectModelUrn] = curr;
        return acc;
      },
      {} as Record<string, {edge: Cell; modelElement: DefaultValue}>,
    );

    for (const value of valuesList) {
      if (value instanceof ScalarValue) {
        continue;
      }

      if (existentValues[value.aspectModelUrn]) {
        this.connectElements(cell, existentValues[value.aspectModelUrn].edge.target);
        delete existentValues[value.aspectModelUrn];
        continue;
      }

      const existingCell = this.inMaxgraph(value);
      if (existingCell) {
        this.connectElements(cell, existingCell);
        continue;
      }

      const valueModel = this.filtersService.createNode(value, {parent: MaxGraphHelper.getModelElement(cell)});
      const valueCell = this.maxgraphService.renderModelElement(valueModel);
      this.connectElements(cell, valueCell);
    }

    this.maxgraphService.removeCells(Object.values(existentValues).map(value => value.edge));
  }

  private connectElements(parentCell: Cell, childCell: Cell) {
    this.maxgraphService.assignToParent(childCell, parentCell);
    MaxGraphHelper.updateLabel(parentCell, this.maxgraphService.graph, this.sammLangService);
    MaxGraphHelper.updateLabel(childCell, this.maxgraphService.graph, this.sammLangService);
  }

  private removeStructuredValueProperties(cell: Cell) {
    const outGoingEdges = this.maxgraphService.graph.getOutgoingEdges(cell, null);
    const toRemove = [];
    for (const edge of outGoingEdges) {
      const metaModel = MaxGraphHelper.getModelElement(edge.target);

      if (metaModel instanceof DefaultProperty) {
        toRemove.push(edge);
      }
    }

    this.maxgraphService.removeCells(toRemove);
  }

  private handleEntityDataType(cell: Cell, dataType: DefaultEntity) {
    if (dataType instanceof DefaultEntity) {
      const entityCell = this.maxgraphService.resolveCellByModelElement(dataType);
      this.maxgraphService.assignToParent(entityCell, cell);
    }
  }

  private removeFloatingEntityValues(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEnumeration>(cell);
    const outGoingCells =
      this.maxgraphService.graph.getOutgoingEdges(cell, null)?.filter(edge => {
        const childModelElement = MaxGraphHelper.getModelElement<DefaultEntityInstance>(edge.target);

        if (childModelElement instanceof DefaultEntity) {
          return true;
        }

        if (!(childModelElement instanceof DefaultEntityInstance)) {
          return false;
        }

        return !this.hasSameEntityAsEnumeration(childModelElement, modelElement);
      }) || [];

    this.maxgraphService.removeCells(
      outGoingCells.map(edge => {
        const modelElement = MaxGraphHelper.getModelElement(edge.target);
        if (modelElement instanceof DefaultEntity) {
          return edge;
        }

        if (!this.loadedFilesService.isElementExtern(modelElement)) {
          this.loadedFilesService.currentLoadedFile.cachedFile.removeElement(modelElement.aspectModelUrn);
        }
        return edge.target;
      }),
    );
  }

  private hasSameEntityAsEnumeration(childModelElement: DefaultEntityInstance, modelElement: DefaultEnumeration) {
    return (
      childModelElement.type.aspectModelUrn === modelElement.dataType?.getUrn() ||
      (childModelElement.parents.some(parent => parent.aspectModelUrn === modelElement.aspectModelUrn) &&
        childModelElement.parents.length > 1)
    );
  }

  private handleBottomOverlay(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (!(modelElement instanceof DefaultEither)) {
      this.maxgraphShapeOverlayService.removeOverlay(cell);
      if (modelElement?.isPredefined) {
        this.maxgraphShapeOverlayService.addTopShapeOverlay(cell);
      } else {
        this.maxgraphShapeOverlayService.addTopShapeOverlay(cell);
        this.maxgraphShapeOverlayService.addBottomShapeOverlay(cell);
      }
    }
  }

  private handleNewDataType(cell: Cell, newDataType: DefaultEntity) {
    if (this.inMaxgraph(newDataType)) {
      return;
    }

    if (newDataType instanceof DefaultEntity) {
      const entityCell = this.maxgraphService.renderModelElement(
        this.filtersService.createNode(newDataType, {parent: MaxGraphHelper.getModelElement(cell)}),
      );
      this.shapeConnectorService.connectShapes(MaxGraphHelper.getModelElement(cell), newDataType, cell, entityCell);
    }
  }

  private removeElementCharacteristic(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    const edgesToRemove = cell.edges?.filter(edge => {
      const sourceNode = MaxGraphHelper.getModelElement(edge.source);
      if (modelElement.aspectModelUrn !== sourceNode.aspectModelUrn) {
        return false;
      }

      const targetModel = MaxGraphHelper.getModelElement(edge.target);
      return targetModel instanceof DefaultCharacteristic && targetModel.aspectModelUrn !== sourceNode.aspectModelUrn;
    });

    this.maxgraphService.removeCells(edgesToRemove || []);
  }

  private handleComplexValues(cell: Cell, form: EnumerationForm) {
    const metaModel = MaxGraphHelper.getModelElement<DefaultEnumeration>(cell);
    if (!(metaModel.dataType instanceof DefaultEntity)) {
      return;
    }

    for (const entityValue of form.chipList) {
      if (this.inMaxgraph(entityValue)) {
        continue;
      }
      this.entityValueRenderer.create(entityValue, cell);
    }

    for (const entityValue of form.deletedEntityValues) {
      this.entityValueRenderer.deleteByModel(entityValue);
    }

    this.maxgraphShapeOverlayService.addBottomShapeOverlay(cell);
  }
}
