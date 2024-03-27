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

import {Injectable, Injector, NgZone} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphCharacteristicHelper, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService, MxGraphVisitorHelper} from '@ame/mx-graph';
import {
  BaseMetaModelElement,
  CharacteristicModelService,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
} from '@ame/meta-model';
import {EntityValueService, RenameModelDialogService} from '@ame/editor';
import {DefaultAbstractEntity, DefaultAbstractProperty, DefaultAspect, DefaultStructuredValue} from '../aspect-meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ModelRootService} from './model-root.service';
import {ModelService, RdfService} from '@ame/rdf/services';
import {NotificationsService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';

@Injectable({providedIn: 'root'})
export class ElementModelService {
  constructor(
    private injector: Injector,
    private titleService: TitleService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphService: MxGraphService,
    private namespacesCacheService: NamespacesCacheService,
    private entityValueService: EntityValueService,
    private sammLangService: SammLanguageSettingsService,
    private modelRootService: ModelRootService,
    private modelService: ModelService,
    private rdfService: RdfService,
    private renameModelService: RenameModelDialogService,
    private notificationService: NotificationsService,
    private translate: LanguageTranslationService,
    private zone: NgZone,
  ) {}

  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  updateElement(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    if (!cell || cell.isEdge()) {
      return;
    }
    const characteristicModelService = this.injector.get(CharacteristicModelService);
    const modelElement = MxGraphHelper.getModelElement(cell);

    const modelService =
      modelElement instanceof DefaultEnumeration ? characteristicModelService : this.modelRootService.getElementModelService(modelElement);
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

    if (this.mxGraphService.getAllCells().length === 1) {
      this.notificationService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.MODEL_EMPTY_MESSAGE,
        message: this.translate.language.NOTIFICATION_SERVICE.MODEL_MINIMUM_ELEMENT_REQUIREMENT,
        timeout: 5000,
      });
      return;
    }

    if (this.handleAspectRemoval(cell)) {
      return;
    }

    const elementModel = MxGraphHelper.getModelElement(cell);
    if (this.modelRootService.isPredefined(elementModel)) {
      const service = this.modelRootService.getPredefinedService(elementModel);
      if (service?.delete && service?.delete?.(cell)) {
        return;
      }
    }

    this.removeElementData(cell);
  }

  decoupleElements(edge: mxgraph.mxCell) {
    const sourceModelElement = MxGraphHelper.getModelElement(edge.source);
    const targetModelElement = MxGraphHelper.getModelElement(edge.target);

    MxGraphHelper.removeRelation(sourceModelElement, targetModelElement);

    if (sourceModelElement.isExternalReference()) {
      return;
    }

    if (this.handleAbstractEntityRemoval(edge)) {
      return;
    }

    if (this.handleAbstractPropertyRemoval(edge, sourceModelElement, targetModelElement)) {
      return;
    }

    if (this.modelRootService.isPredefined(sourceModelElement)) {
      const service = this.modelRootService.getPredefinedService(sourceModelElement);
      if (service?.decouple && service?.decouple?.(edge, sourceModelElement)) {
        return;
      }
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
      MxGraphHelper.updateLabel(edge.source, this.mxGraphService.graph, this.sammLangService);
    }

    this.removeConnectionBetweenElements(edge, sourceModelElement, targetModelElement);
    this.mxGraphService.removeCells([edge]);
  }

  private handleAspectRemoval(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!(modelElement instanceof DefaultAspect)) {
      return false;
    }
    this.zone.run(() => {
      this.renameModelService.open().subscribe(data => {
        if (!data?.name) {
          return;
        }

        const rdfModel = this.rdfService.currentRdfModel;
        this.modelService.removeAspect();
        this.removeElementData(cell);
        if (!rdfModel.originalAbsoluteFileName) {
          rdfModel.originalAbsoluteFileName = rdfModel.absoluteAspectModelFileName;
        }
        rdfModel.absoluteAspectModelFileName = '';
        this.currentCachedFile.fileName = '';
        rdfModel.absoluteAspectModelFileName = `${rdfModel.getAspectModelUrn()}${data.name}`;
        this.titleService.updateTitle(rdfModel.absoluteAspectModelFileName, 'Shared');
      });
    });

    return true;
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

      for (const property of properties) {
        MxGraphHelper.removeRelation(MxGraphHelper.getModelElement(parent), MxGraphHelper.getModelElement(property));
      }

      toRemove.push(...properties);
    }

    this.mxGraphService.removeCells(toRemove);
    const source = MxGraphHelper.getModelElement<DefaultEntity>(edge.source);
    source.extendedElement = null;
    MxGraphHelper.updateLabel(edge.source, this.mxGraphService.graph, this.sammLangService);
    return true;
  }

  private handleAbstractPropertyRemoval(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (
      (source instanceof DefaultProperty && target instanceof DefaultAbstractProperty) ||
      (source instanceof DefaultProperty && target instanceof DefaultProperty)
    ) {
      const sourceElement = MxGraphHelper.getModelElement(edge.source);
      MxGraphHelper.removeRelation(sourceElement, MxGraphHelper.getModelElement(edge.target));
      this.currentCachedFile.removeElement(sourceElement.aspectModelUrn);
      this.mxGraphService.removeCells([edge, edge.source]);
      return true;
    }

    return false;
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
        this.sammLangService,
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
      if (target.extendedElement) {
        this.mxGraphService.removeCells([edge.target]);
      }

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
    MxGraphHelper.removeRelation(source, target);
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
    edge: mxgraph.mxCell,
  ): void {
    if (sourceModelElement instanceof DefaultEnumeration && targetModelElement instanceof DefaultEntityValue) {
      const entityValueIndex = sourceModelElement.values.indexOf(targetModelElement);
      const enumerationIndex = targetModelElement.parents.indexOf(sourceModelElement);

      sourceModelElement.values.splice(entityValueIndex, 1);
      targetModelElement.parents.splice(enumerationIndex, 1);

      this.currentCachedFile.removeElement(targetModelElement.aspectModelUrn);
      this.mxGraphService.removeCells([edge.target]);
    }
  }

  private removeElementData(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    const elementModelService = this.modelRootService.getElementModelService(modelElement);

    for (const parent of modelElement.parents) {
      MxGraphHelper.removeRelation(parent, modelElement);
    }

    for (const child of modelElement.children) {
      MxGraphHelper.removeRelation(modelElement, child);
    }

    elementModelService?.delete(cell);
    this.namespacesCacheService.currentCachedFile.removeElement(MxGraphHelper.getModelElement(cell).aspectModelUrn);
  }
}
