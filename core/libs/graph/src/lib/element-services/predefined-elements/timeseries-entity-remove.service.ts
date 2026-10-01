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
import {inject, Injectable} from '@angular/core';
import {DefaultEntity, DefaultProperty, NamedElement, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {ModelRootService} from '../model-root.service';
import {PredefinedRemove} from './predefined-remove.type';

@Injectable({providedIn: 'root'})
export class TimeSeriesEntityRemoveService implements PredefinedRemove {
  private readonly modelRootService = inject(ModelRootService);

  public readonly graphAdapter = inject(GraphAdapterPort, {optional: true});

  public delete(cell: any) {
    const modelElement = ElementRelationUtil.getModelElement(cell);

    if (
      modelElement instanceof DefaultEntity &&
      modelElement.isPredefined &&
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

    const foundCell = (this.graphAdapter?.getIncomingEdges(cell) || []).find(e => {
      const model = ElementRelationUtil.getModelElement(e.source);
      return model instanceof DefaultProperty && model.name === PredefinedPropertiesEnum.timestamp && model.isPredefined;
    })?.source;

    if (foundCell) {
      this.handleTimeSeriesEntityPropertiesRemoval(foundCell);
      return true;
    }

    return false;
  }

  public decouple(edge: any, source: NamedElement) {
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

  private handleTimeSeriesEntityTreeRemoval(cell: any) {
    const cellStack = (this.graphAdapter?.getOutgoingEdges(cell) || []).map(edge => edge.target);
    const cellsToBeRemoved = [];

    for (const edge of this.graphAdapter?.getIncomingEdges(cell) || []) {
      ElementRelationUtil.removeRelation(ElementRelationUtil.getModelElement(edge.source), ElementRelationUtil.getModelElement(cell));
    }

    while (cellStack.length) {
      const lastCell = cellStack.pop();
      const modelElement = ElementRelationUtil.getModelElement(lastCell);
      const parentsEdges = this.graphAdapter?.getIncomingEdges(lastCell) || [];

      const dependentProperties = parentsEdges.filter(e => {
        const parentElement = ElementRelationUtil.getModelElement(e.source);
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

      cellStack.push(...(this.graphAdapter?.getOutgoingEdges(lastCell) || []).map(edge => edge.target));
      cellsToBeRemoved.push(lastCell);
    }

    [cell, ...cellsToBeRemoved].forEach(c => {
      const modelElement = ElementRelationUtil.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });
  }

  private handleTimeSeriesEntityPropertiesRemoval(cell: any) {
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    const timeSeriesCell = incomingEdges.find(edge => {
      const modelElement = ElementRelationUtil.getModelElement(edge.source);
      return (
        modelElement instanceof DefaultEntity && modelElement.isPredefined && modelElement.name === PredefinedEntitiesEnum.TimeSeriesEntity
      );
    })?.source;

    if (timeSeriesCell) {
      this.handleTimeSeriesEntityTreeRemoval(timeSeriesCell);
    } else {
      this.handleTimeSeriesEntityTreeRemoval(cell);
    }
  }
}
