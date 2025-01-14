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
import {DefaultEntity, DefaultProperty, NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesEntityRemoveService implements PredefinedRemove {
  constructor(
    private mxGraphService: MxGraphService,
    private modelRootService: ModelRootService,
  ) {}

  public delete(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);

    if (
      modelElement instanceof DefaultEntity &&
      modelElement.isAbstractEntity() &&
      modelElement.name === PredefinedEntitiesEnum.TimeSeriesEntity
    ) {
      this.handleTimeSeriesEntityTreeRemoval(cell);
      return true;
    }

    if (
      (modelElement instanceof DefaultProperty && modelElement.name === PredefinedPropertiesEnum.timestamp) ||
      (modelElement instanceof DefaultProperty && modelElement.isAbstract && modelElement.name === PredefinedPropertiesEnum.value)
    ) {
      this.handleTimeSeriesEntityPropertiesRemoval(cell);
      return true;
    }

    const foundCell = this.mxGraphService.graph.getIncomingEdges(cell).find(e => {
      const model = MxGraphHelper.getModelElement(e.source);
      return model instanceof DefaultProperty && model.name === PredefinedPropertiesEnum.timestamp && model.isPredefined;
    })?.source;

    if (foundCell) {
      this.handleTimeSeriesEntityPropertiesRemoval(foundCell);
      return true;
    }

    return false;
  }

  public decouple(edge: mxgraph.mxCell, source: NamedElement) {
    if (!source?.isPredefined) {
      return false;
    }

    if (source instanceof DefaultEntity && source.isAbstractEntity() && source.name === PredefinedEntitiesEnum.TimeSeriesEntity) {
      this.handleTimeSeriesEntityTreeRemoval(edge.source);
      return true;
    }

    if (source instanceof DefaultProperty && source.name === PredefinedPropertiesEnum.timestamp) {
      this.handleTimeSeriesEntityPropertiesRemoval(edge.source);
      return true;
    }

    return false;
  }

  private handleTimeSeriesEntityTreeRemoval(cell: mxgraph.mxCell) {
    const cellStack = this.mxGraphService.graph.getOutgoingEdges(cell).map(edge => edge.target);
    const cellsToBeRemoved = [];

    for (const edge of this.mxGraphService.graph.getIncomingEdges(cell)) {
      MxGraphHelper.removeRelation(MxGraphHelper.getModelElement(edge.source), MxGraphHelper.getModelElement(cell));
    }

    while (cellStack.length) {
      const lastCell = cellStack.pop();
      const modelElement = MxGraphHelper.getModelElement(lastCell);
      const parentsEdges = this.mxGraphService.graph.getIncomingEdges(lastCell);

      const dependentProperties = parentsEdges.filter(e => {
        const parentElement = MxGraphHelper.getModelElement(e.source);
        return (parentElement instanceof DefaultProperty && parentElement.isAbstract) || parentElement instanceof DefaultProperty;
      });

      const hasAbstractEntityAsParent = parentsEdges.length - dependentProperties.length === 1;
      if (
        modelElement instanceof DefaultProperty &&
        modelElement.isAbstract &&
        modelElement.name === PredefinedPropertiesEnum.value &&
        hasAbstractEntityAsParent &&
        dependentProperties.length > 1
      ) {
        continue;
      }

      if (
        modelElement instanceof DefaultProperty &&
        modelElement.name === PredefinedPropertiesEnum.timestamp &&
        hasAbstractEntityAsParent &&
        dependentProperties?.length > 0
      ) {
        continue;
      }

      cellStack.push(...this.mxGraphService.graph.getOutgoingEdges(lastCell).map(edge => edge.target));
      cellsToBeRemoved.push(lastCell);
    }

    [cell, ...cellsToBeRemoved].forEach(c => {
      const modelElement = MxGraphHelper.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });
  }

  private handleTimeSeriesEntityPropertiesRemoval(cell: mxgraph.mxCell) {
    const incomingEdges = this.mxGraphService.graph.getIncomingEdges(cell);
    const timeSeriesCell = incomingEdges.find(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.source);
      return (
        modelElement instanceof DefaultEntity &&
        modelElement.isAbstractEntity() &&
        modelElement.name === PredefinedEntitiesEnum.TimeSeriesEntity
      );
    })?.source;

    if (timeSeriesCell) {
      this.handleTimeSeriesEntityTreeRemoval(timeSeriesCell);
    } else {
      this.handleTimeSeriesEntityTreeRemoval(cell);
    }
  }
}
