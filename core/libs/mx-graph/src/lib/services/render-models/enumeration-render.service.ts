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
import {FiltersService} from '@ame/loader-filters';
import {MxGraphShapeOverlayService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Injectable, inject} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {EntityValueRenderService} from './entity-value-render.service';
import {UnitRenderService} from './unit-render.service';

interface EnumerationForm {
  chipList: DefaultEntityInstance[];
  deletedEntityValues: DefaultEntityInstance[];

  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class EnumerationRenderService extends BaseRenderService {
  private filtersService = inject(FiltersService);

  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    protected loadedFilesService: LoadedFilesService,
    private shapeConnectorService: ShapeConnectorService,
    private entityValueRenderer: EntityValueRenderService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private unitRendererService: UnitRenderService,
  ) {
    super(mxGraphService, sammLangService, loadedFilesService);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultEnumeration;
  }

  update({cell, form}) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    this.handleBottomOverlay(cell);
    if (form.newDataType) {
      this.handleNewDataType(cell, form.newDataType);
    } else if (metaModelElement.dataType instanceof DefaultEntity) {
      this.handleEntityDataType(cell, metaModelElement.dataType);
    } else {
      this.removeFloatingEntityValues(cell);
    }
    this.handleComplexValues(cell, form);
    this.removeElementCharacteristic(cell);
    this.unitRendererService.removeFrom(cell);
    this.removeStructuredValueProperties(cell);
    super.update({cell, form});
  }

  private removeStructuredValueProperties(cell: mxgraph.mxCell) {
    const outGoingEdges = this.mxGraphService.graph.getOutgoingEdges(cell);
    const toRemove = [];
    for (const edge of outGoingEdges) {
      const metaModel = MxGraphHelper.getModelElement(edge.target);
      metaModel instanceof DefaultProperty && toRemove.push(edge);
    }

    this.mxGraphService.removeCells(toRemove);
  }

  private handleEntityDataType(cell: mxgraph.mxCell, dataType: DefaultEntity) {
    if (dataType instanceof DefaultEntity) {
      const entityCell = this.mxGraphService.resolveCellByModelElement(dataType);
      this.shapeConnectorService.connectShapes(MxGraphHelper.getModelElement(cell), dataType, cell, entityCell);
    }
  }

  private removeFloatingEntityValues(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEnumeration>(cell);
    const outGoingCells =
      this.mxGraphService.graph.getOutgoingEdges(cell)?.filter(edge => {
        const childModelElement = MxGraphHelper.getModelElement<DefaultEntityInstance>(edge.target);

        if (childModelElement instanceof DefaultEntity) {
          return true;
        }

        if (!(childModelElement instanceof DefaultEntityInstance)) {
          return false;
        }

        return !this.hasSameEntityAsEnumeration(childModelElement, modelElement);
      }) || [];

    this.mxGraphService.removeCells(
      outGoingCells.map(edge => {
        const modelElement = MxGraphHelper.getModelElement(edge.target);
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

  private handleBottomOverlay(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (!(modelElement instanceof DefaultEither)) {
      this.mxGraphShapeOverlayService.removeOverlay(cell);
      if (modelElement?.isPredefined) {
        this.mxGraphShapeOverlayService.addTopShapeOverlay(cell);
      } else {
        this.mxGraphShapeOverlayService.addTopShapeOverlay(cell);
        this.mxGraphShapeOverlayService.addBottomShapeOverlay(cell);
      }
    }
  }

  private handleNewDataType(cell: mxgraph.mxCell, newDataType: DefaultEntity) {
    if (this.inMxGraph(newDataType)) {
      return;
    }

    if (newDataType instanceof DefaultEntity) {
      const entityCell = this.mxGraphService.renderModelElement(
        this.filtersService.createNode(newDataType, {parent: MxGraphHelper.getModelElement(cell)}),
      );
      this.shapeConnectorService.connectShapes(MxGraphHelper.getModelElement(cell), newDataType, cell, entityCell);
    }
  }

  private removeElementCharacteristic(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    const edgesToRemove = cell.edges?.filter(edge => {
      const sourceNode = MxGraphHelper.getModelElement(edge.source);
      if (modelElement.aspectModelUrn !== sourceNode.aspectModelUrn) {
        return false;
      }

      const targetModel = MxGraphHelper.getModelElement(edge.target);
      return targetModel instanceof DefaultCharacteristic && targetModel.aspectModelUrn !== sourceNode.aspectModelUrn;
    });

    this.mxGraphService.removeCells(edgesToRemove || []);
  }

  private handleComplexValues(cell: mxgraph.mxCell, form: EnumerationForm) {
    const metaModel = MxGraphHelper.getModelElement<DefaultEnumeration>(cell);
    if (!(metaModel.dataType instanceof DefaultEntity)) {
      return;
    }

    for (const entityValue of form.chipList) {
      if (this.inMxGraph(entityValue)) {
        continue;
      }
      this.entityValueRenderer.create(entityValue, cell);
    }

    for (const entityValue of form.deletedEntityValues) {
      this.entityValueRenderer.deleteByModel(entityValue);
    }

    this.mxGraphShapeOverlayService.addBottomShapeOverlay(cell);
  }
}
