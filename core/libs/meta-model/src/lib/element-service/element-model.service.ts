/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable, Injector} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphCharacteristicHelper, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService, MxGraphVisitorHelper} from '@ame/mx-graph';
import {
  AspectModelService,
  BaseMetaModelElement,
  BaseModelService,
  CharacteristicModelService,
  ConstraintModelService,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  EntityModelService,
  EntityValueModelService,
  EventModelService,
  OperationModelService,
  PropertyModelService,
  TraitModelService,
  UnitModelService,
  AbstractPropertyModelService,
} from '@ame/meta-model';
import {EntityValueService} from '@ame/editor';
import {DefaultAbstractEntity, DefaultAbstractProperty, DefaultStructuredValue} from '../aspect-meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {AbstractEntityModelService} from './abstract-entity-model.service';

@Injectable({providedIn: 'root'})
export class ElementModelService {
  constructor(
    private injector: Injector,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphService: MxGraphService,
    private namespacesCacheService: NamespacesCacheService,
    private entityValueService: EntityValueService,
    private languageSettingsService: LanguageSettingsService
  ) {}

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  updateElement(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    if (!cell || cell.isEdge()) {
      return;
    }
    const characteristicModelService = this.injector.get(CharacteristicModelService);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const modelService =
      modelElement instanceof DefaultEnumeration ? characteristicModelService : this.getElementModelService(modelElement);
    modelService.update(cell, form);
  }

  deleteElement(cell: mxgraph.mxCell) {
    if (!cell) {
      return;
    }

    if (cell?.isEdge()) {
      this.decoupleElements(cell);
      return;
    }

    if (this.handleTimeSeriesEntityCellRemoval(cell)) {
      return;
    }

    const modelElement = MxGraphHelper.getModelElement(cell);
    const elementModelService = this.getElementModelService(modelElement);
    elementModelService?.delete(cell);
  }

  decoupleElements(edge: mxgraph.mxCell) {
    const sourceModelElement = MxGraphHelper.getModelElement(edge.source);
    const targetModelElement = MxGraphHelper.getModelElement(edge.target);

    if (sourceModelElement.isExternalReference()) {
      return;
    }

    if (this.handleAbstractEntityRemoval(edge)) {
      return;
    }

    if (this.handleAbstractPropertyRemoval(edge, sourceModelElement, targetModelElement)) {
      return;
    }

    if (this.handleTimeSeriesEntityDecoupling(edge, sourceModelElement)) {
      return;
    }

    if (this.handleAbstractElementsDecoupling(edge, sourceModelElement, targetModelElement)) {
      return;
    }

    if (this.handleEntityPropertyDecoupling(edge, sourceModelElement, targetModelElement)) {
      return;
    }

    this.decoupleEnumerationFromEntityValue(sourceModelElement, targetModelElement, edge);

    if (this.handleEnumerationEntityDecoupling(edge, sourceModelElement, targetModelElement)) {
      return;
    }

    if (sourceModelElement instanceof DefaultEntityValue && targetModelElement instanceof DefaultEntity) {
      this.mxGraphService.updateEnumerationsWithEntityValue(sourceModelElement);
      this.mxGraphService.updateEntityValuesWithCellReference([edge.source]);
      this.mxGraphService.removeCells([edge.source]);
    }

    if (targetModelElement instanceof DefaultEntityValue) {
      this.mxGraphService.updateEnumerationsWithEntityValue(targetModelElement);
      this.mxGraphService.removeCells([edge.target]);
    }

    if (sourceModelElement instanceof DefaultStructuredValue && targetModelElement instanceof DefaultProperty) {
      sourceModelElement.delete(targetModelElement);
      MxGraphHelper.updateLabel(edge.source, this.mxGraphService.graph, this.languageSettingsService);
    }

    this.removeConnectionBetweenElements(edge, sourceModelElement, targetModelElement);
    this.mxGraphService.removeCells([edge]);
  }

  private handleAbstractEntityRemoval(edge: mxgraph.mxCell) {
    if (!(MxGraphHelper.getModelElement(edge.target) instanceof DefaultAbstractEntity)) {
      return false;
    }

    const parents = this.mxGraphService.resolveParents(edge.target)?.filter(c => MxGraphHelper.getModelElement(c) instanceof DefaultEntity);
    const toRemove = [edge];

    for (const parent of parents) {
      const properties = this.mxGraphService.graph
        .getOutgoingEdges(parent)
        .map(e => e.target)
        .filter(c => !!MxGraphHelper.getModelElement<DefaultProperty>(c)?.extendedElement);
      toRemove.push(...properties);
    }

    this.mxGraphService.removeCells(toRemove);
    return true;
  }

  private handleAbstractPropertyRemoval(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (
      (source instanceof DefaultProperty && target instanceof DefaultAbstractProperty) ||
      (source instanceof DefaultProperty && target instanceof DefaultProperty)
    ) {
      this.currentCachedFile.removeCachedElement(MxGraphHelper.getModelElement(edge.source).aspectModelUrn);
      this.mxGraphService.removeCells([edge, edge.source]);
      return true;
    }

    return false;
  }

  private handleTimeSeriesEntityCellRemoval(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);

    if (modelElement instanceof DefaultAbstractEntity && modelElement.name === 'TimeSeriesEntity') {
      this.handleTimeSeriesEntityTreeRemoval(cell);
      return true;
    }

    if (
      (modelElement instanceof DefaultProperty && modelElement.name === 'timestamp') ||
      (modelElement instanceof DefaultAbstractProperty && modelElement.name === 'value')
    ) {
      this.handleTimeSeriesEntityPropertiesRemoval(cell);
      return true;
    }

    const foundCell = this.mxGraphService.graph.getIncomingEdges(cell).find(e => {
      const model = MxGraphHelper.getModelElement(e.source);
      return model instanceof DefaultProperty && model.name === 'timestamp' && model.isPredefined();
    })?.source;

    if (foundCell) {
      this.handleTimeSeriesEntityPropertiesRemoval(foundCell);
      return true;
    }

    return false;
  }

  private handleTimeSeriesEntityDecoupling(edge: mxgraph.mxCell, source: BaseMetaModelElement) {
    const isSourcePredefined = typeof source['isPredefined'] === 'function' && source['isPredefined']();

    if (!isSourcePredefined) {
      return false;
    }

    if (source instanceof DefaultAbstractEntity && source.name === 'TimeSeriesEntity') {
      this.handleTimeSeriesEntityTreeRemoval(edge.source);
      return true;
    }

    if (source instanceof DefaultProperty && source.name === 'timestamp') {
      this.handleTimeSeriesEntityPropertiesRemoval(edge.source);
      return true;
    }

    return false;
  }

  private handleTimeSeriesEntityPropertiesRemoval(cell: mxgraph.mxCell) {
    const incomingEdges = this.mxGraphService.graph.getIncomingEdges(cell);
    const timeSeriesCell = incomingEdges.find(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.source);
      return modelElement instanceof DefaultAbstractEntity && modelElement.name === 'TimeSeriesEntity';
    })?.source;

    if (timeSeriesCell) {
      this.handleTimeSeriesEntityTreeRemoval(timeSeriesCell);
    } else {
      this.handleTimeSeriesEntityTreeRemoval(cell);
    }
  }

  private handleTimeSeriesEntityTreeRemoval(cell: mxgraph.mxCell) {
    const cellStack = this.mxGraphService.graph.getOutgoingEdges(cell).map(edge => edge.target);
    const cellsToBeRemoved = [];

    while (cellStack.length) {
      const lastCell = cellStack.pop();
      const modelElement = MxGraphHelper.getModelElement(lastCell);
      const parentsEdges = this.mxGraphService.graph.getIncomingEdges(lastCell);

      const dependentProperties = parentsEdges.filter(e => {
        const parentElement = MxGraphHelper.getModelElement(e.source);
        return parentElement instanceof DefaultAbstractProperty || parentElement instanceof DefaultProperty;
      });

      const hasAbstractEntityAsParent = parentsEdges.length - dependentProperties.length === 1;
      if (
        modelElement instanceof DefaultAbstractProperty &&
        modelElement.name === 'value' &&
        hasAbstractEntityAsParent &&
        dependentProperties.length > 1
      ) {
        continue;
      }

      if (
        modelElement instanceof DefaultProperty &&
        modelElement.name === 'timestamp' &&
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
      const elementModelService = this.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });
  }

  private handleAbstractElementsDecoupling(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (
      (source instanceof DefaultEntity && target instanceof DefaultAbstractEntity) ||
      (source instanceof DefaultAbstractEntity && target instanceof DefaultAbstractEntity) ||
      (source instanceof DefaultEntity && target instanceof DefaultEntity) ||
      (source instanceof DefaultAbstractProperty && target instanceof DefaultAbstractProperty)
    ) {
      source.extendedElement = null;
      edge.source['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
        MxGraphHelper.getModelElement(edge.source),
        this.languageSettingsService
      );
      this.mxGraphService.graph.labelChanged(edge.source, MxGraphHelper.createPropertiesLabel(edge.source));
      this.removeConnectionBetweenElements(edge, source, target);
      this.mxGraphService.removeCells([edge]);
      return true;
    }

    return false;
  }

  private handleEntityPropertyDecoupling(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (source instanceof DefaultEntity && target instanceof DefaultProperty) {
      this.entityValueService.onPropertyRemove(target, () => {
        this.removeConnectionBetweenElements(edge, source, target);
        this.mxGraphService.removeCells([edge]);
      });

      return true;
    }

    return false;
  }

  private handleEnumerationEntityDecoupling(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (source instanceof DefaultEnumeration && target instanceof DefaultEntity) {
      return this.entityValueService.onEntityDisconnect(source, target, () => {
        const obsoleteEntityValues = MxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
        this.removeConnectionBetweenElements(edge, source, target);
        this.mxGraphService.updateEntityValuesWithCellReference(obsoleteEntityValues);
        this.mxGraphService.removeCells([edge, ...obsoleteEntityValues]);
      });
    }

    return false;
  }

  private removeConnectionBetweenElements(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (MxGraphHelper.isComplexEnumeration(source)) {
      this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
    }
    (source as any).delete(target);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(new Array(edge), source);
    edge.target.removeEdge(edge, false);
    edge.source.removeEdge(edge, true);
  }

  /**
   * Decouple enumeration - entityValue when the edge between them will be deleted
   *
   * @param sourceModelElement - source enumeration
   * @param targetModelElement - target entity value
   * @param edge - deleted edge
   */
  private decoupleEnumerationFromEntityValue(
    sourceModelElement: BaseMetaModelElement,
    targetModelElement: BaseMetaModelElement,
    edge: mxgraph.mxCell
  ): void {
    if (sourceModelElement instanceof DefaultEnumeration && targetModelElement instanceof DefaultEntityValue) {
      const entityValueIndex = sourceModelElement.values.indexOf(targetModelElement);
      const enumerationIndex = targetModelElement.parents.indexOf(sourceModelElement);

      sourceModelElement.values.splice(entityValueIndex, 1);
      targetModelElement.parents.splice(enumerationIndex, 1);

      this.currentCachedFile.removeCachedElement(targetModelElement.aspectModelUrn);
      this.mxGraphService.removeCells([edge.target]);
    }
  }

  private getElementModelService(modelElement: BaseMetaModelElement): BaseModelService {
    // Order is important
    const elementServices: any[] = [
      AbstractEntityModelService,
      AbstractPropertyModelService,
      AspectModelService,
      TraitModelService,
      CharacteristicModelService,
      ConstraintModelService,
      EntityModelService,
      EntityValueModelService,
      EventModelService,
      OperationModelService,
      PropertyModelService,
      UnitModelService,
    ];

    // choose the applicable model service
    for (const serviceClass of elementServices) {
      const elementModelService = this.injector.get(serviceClass);
      if (elementModelService.isApplicable(modelElement)) {
        return elementModelService;
      }
    }
    return null;
  }
}
