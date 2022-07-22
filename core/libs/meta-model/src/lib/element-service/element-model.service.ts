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
import {
  MxAttributeName,
  MxGraphCharacteristicHelper,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
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

  private handleTimeSeriesEntityDecoupling(edge: mxgraph.mxCell, source: BaseMetaModelElement) {
    const isSourcePredefined = typeof source['isPredefined'] === 'function' && source['isPredefined']();

    if (!isSourcePredefined) {
      return false;
    }

    if (source instanceof DefaultAbstractEntity && source.name === 'TimeSeriesEntity') {
      //

      return true;
    }

    if (
      (source instanceof DefaultProperty && source.name === 'value') ||
      (source instanceof DefaultAbstractProperty && source.name === 'timestamp')
    ) {
      //
      return true;
    }

    return false;
  }

  private handleAbstractElementsDecoupling(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (
      (source instanceof DefaultEntity && target instanceof DefaultAbstractEntity) ||
      (source instanceof DefaultProperty && target instanceof DefaultAbstractProperty) ||
      (source instanceof DefaultEntity && target instanceof DefaultEntity) ||
      (source instanceof DefaultProperty && target instanceof DefaultProperty)
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
        const valuesCell = edge.source.children?.find(
          childCell => childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY) === 'values'
        );
        const obsoleteEntityValues = MxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
        this.removeConnectionBetweenElements(edge, source, target);
        this.mxGraphService.updateEntityValuesWithCellReference(obsoleteEntityValues);
        this.mxGraphService.removeCells([edge, valuesCell, ...obsoleteEntityValues]);
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
