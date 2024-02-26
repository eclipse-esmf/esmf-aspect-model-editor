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

import {Injectable, inject} from '@angular/core';
import {ShapeConnectorService} from '@ame/connection';
import {DefaultEntity, DefaultEntityValue, DefaultEnumeration, DefaultState, EntityValueProperty} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {EdgeStyles, RendererUpdatePayload} from '../../models';
import {MxGraphAttributeService} from '../mx-graph-attribute.service';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {RdfService} from '@ame/rdf/services';
import {FiltersService} from '@ame/loader-filters';

@Injectable({
  providedIn: 'root',
})
export class EntityValueRenderService extends BaseRenderService {
  private filtersService = inject(FiltersService);

  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    rdfService: RdfService,
    private mxGraphShapeOverlay: MxGraphShapeOverlayService,
    private shapeConnectorService: ShapeConnectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
  ) {
    super(mxGraphService, sammLangService, rdfService);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultEntityValue;
  }

  update({cell}: RendererUpdatePayload) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntityValue>(cell);

    this.removeChildrenEntityValuesIfNecessary(cell);

    for (const property of modelElement.properties || []) {
      if (!(property.value instanceof DefaultEntityValue)) {
        continue;
      }

      if (this.isChildOf(cell, property.value)) {
        continue;
      }

      this.connectEntityValues(modelElement, property.value);
    }

    super.update({cell});
  }

  create(modelElement: DefaultEntityValue, parent: mxgraph.mxCell) {
    this.shapeConnectorService.createAndConnectShape(modelElement, parent);
    this.mxGraphShapeOverlay.removeOverlaysByConnection(modelElement, parent);

    const parentModelElement = MxGraphHelper.getModelElement<DefaultEnumeration>(parent);
    MxGraphHelper.establishRelation(parentModelElement, modelElement);
    MxGraphHelper.establishRelation(modelElement, parentModelElement.dataType as DefaultEntity);
    if (parentModelElement.dataType instanceof DefaultEntity) {
      this.connectEntityValueWithChildren(modelElement);
    }
  }

  delete(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntityValue>(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.updateEnumeration(modelElement, incomingEdges);
    this.mxGraphService.updateEnumerationsWithEntityValue(modelElement);
    this.mxGraphService.updateEntityValuesWithReference(modelElement);
    this.mxGraphService.removeCells([cell]);
  }

  private updateEnumeration(entityValue: DefaultEntityValue, incomingEdges: Array<mxgraph.mxCell>) {
    const edge = incomingEdges.find(incomingEdge => MxGraphHelper.getModelElement(incomingEdge?.source) instanceof DefaultEnumeration);
    const metaModelElement = MxGraphHelper.getModelElement(edge?.source);

    if (!(metaModelElement instanceof DefaultEnumeration)) {
      return;
    }

    const entityValueIndex = metaModelElement.values.indexOf(entityValue);
    if (entityValueIndex >= 0) {
      metaModelElement.values.splice(entityValueIndex, 1);
    }
  }

  deleteByModel(modelElement: DefaultEntityValue) {
    const modelCell = this.mxGraphService
      .getAllCells()
      .find(cell => MxGraphHelper.getModelElement(cell).aspectModelUrn === modelElement.aspectModelUrn);

    if (!modelCell) {
      return;
    }

    this.delete(modelCell);
  }

  private connectEntityValueWithChildren(modelElement: DefaultEntityValue) {
    for (const property of modelElement.properties || []) {
      if (!(property.value instanceof DefaultEntityValue)) {
        continue;
      }

      this.connectEntityValues(modelElement, property.value);
      this.connectEntityValueWithChildren(property.value);
    }
  }

  private isChildOf(parent: mxgraph.mxCell, child: DefaultEntityValue) {
    return this.mxGraphService.graph
      .getOutgoingEdges(parent)
      .find(edge => MxGraphHelper.getModelElement(edge.target).aspectModelUrn === child?.aspectModelUrn);
  }

  private connectEntityValues(parent: DefaultEntityValue, child: DefaultEntityValue) {
    const inGraph = this.inMxGraph(child);

    if (!inGraph) {
      // Render ChildEntityValue
      this.mxGraphService.renderModelElement(this.filtersService.createNode(child, {parent}));

      // Connect ChildEntityValue with its entity
      this.mxGraphService.assignToParent(
        this.mxGraphService.resolveCellByModelElement(child.entity),
        this.mxGraphService.resolveCellByModelElement(child),
        EdgeStyles.entityValueEntityEdge,
      );
    }

    // Connect EntityValue with ChildEntityValue
    this.mxGraphService.assignToParent(
      this.mxGraphService.resolveCellByModelElement(child),
      this.mxGraphService.resolveCellByModelElement(parent),
      EdgeStyles.entityValueEntityEdge,
    );
  }

  private removeChildrenEntityValuesIfNecessary(cell: mxgraph.mxCell) {
    const children = this.mxGraphService.graph.getOutgoingEdges(cell);
    const modelElement = MxGraphHelper.getModelElement<DefaultEntityValue>(cell);

    if (!children.length) {
      return;
    }

    children
      .map(edge => edge.target)
      .filter(child => child && child.id !== cell.id && MxGraphHelper.getModelElement(child) instanceof DefaultEntityValue)
      .forEach(child => {
        const connectingEdge: mxgraph.mxCell = this.mxGraphService.graph.getIncomingEdges(child).find(edge => edge?.source == cell);
        const isLinkedToOtherEntityValues = this.mxGraphService.graph.getOutgoingEdges(child).some(edge => {
          if (!edge?.source) {
            return false;
          }

          const parentModelElement = MxGraphHelper.getModelElement(edge.source);
          if (
            !(parentModelElement instanceof DefaultEntityValue) ||
            !(parentModelElement instanceof DefaultEnumeration) ||
            !(parentModelElement instanceof DefaultState)
          ) {
            return false;
          }

          return parentModelElement.aspectModelUrn !== modelElement.aspectModelUrn;
        });
        const childModelElement = MxGraphHelper.getModelElement(child);
        const isPartOfTheModel = modelElement.properties.some((prop: EntityValueProperty) => prop.value === childModelElement);
        if (!isLinkedToOtherEntityValues && !childModelElement.parents?.length && !isPartOfTheModel) {
          this.delete(child);
        } else if (!isLinkedToOtherEntityValues && childModelElement.parents?.length > 0 && !isPartOfTheModel && connectingEdge) {
          this.mxGraphService.removeCells([connectingEdge]);
        }
      });
  }
}
