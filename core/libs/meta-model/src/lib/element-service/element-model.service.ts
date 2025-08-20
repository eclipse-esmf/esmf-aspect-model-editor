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
import {EntityInstanceService, RenameModelDialogService} from '@ame/editor';
import {MxGraphCharacteristicHelper, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService, MxGraphVisitorHelper} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {useUpdater} from '@ame/utils';
import {Injectable, Injector, NgZone} from '@angular/core';
import {
  DefaultAspect,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  DefaultStructuredValue,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {CharacteristicModelService} from './characteristic-model.service';
import {ModelRootService} from './model-root.service';

@Injectable({providedIn: 'root'})
export class ElementModelService {
  constructor(
    private injector: Injector,
    private titleService: TitleService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphService: MxGraphService,
    private entityInstanceService: EntityInstanceService,
    private sammLangService: SammLanguageSettingsService,
    private modelRootService: ModelRootService,
    private modelService: ModelService,
    private renameModelService: RenameModelDialogService,
    private notificationService: NotificationsService,
    private translate: LanguageTranslationService,
    private loadedFilesService: LoadedFilesService,
    private zone: NgZone,
  ) {}

  get currentCachedFile() {
    return this.loadedFilesService.currentLoadedFile.cachedFile;
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
    if (elementModel.isPredefined) {
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

    if (this.loadedFilesService.isElementExtern(sourceModelElement)) {
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

    if (sourceModelElement instanceof DefaultEntityInstance && targetModelElement instanceof DefaultEntity) {
      this.mxGraphService.updateEnumerationsWithEntityValue(sourceModelElement);
      this.mxGraphService.updateEntityValuesWithCellReference([edge.source]);
      this.mxGraphService.removeCells([edge.source]);
    }

    if (targetModelElement instanceof DefaultEntityInstance) {
      this.mxGraphService.updateEnumerationsWithEntityValue(targetModelElement);
      this.mxGraphService.removeCells([edge.target]);
    }

    if (sourceModelElement instanceof DefaultStructuredValue && targetModelElement instanceof DefaultProperty) {
      useUpdater(sourceModelElement).delete(targetModelElement);
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

        const loadedFile = this.loadedFilesService.currentLoadedFile;
        this.modelService.removeAspect();
        this.removeElementData(cell);

        this.loadedFilesService.updateAbsoluteName(loadedFile.absoluteName, `${loadedFile.namespace}:${data.name}`);
        this.titleService.updateTitle(loadedFile.absoluteName);
      });
    });

    return true;
  }

  private handleAbstractEntityRemoval(edge: mxgraph.mxCell) {
    const target = MxGraphHelper.getModelElement(edge.target);
    if (!(target instanceof DefaultEntity && target.isAbstractEntity())) {
      return false;
    }

    const parents = this.mxGraphService.resolveParents(edge.target)?.filter(c => MxGraphHelper.getModelElement(c) instanceof DefaultEntity);
    const toRemove = [edge];

    for (const parent of parents) {
      const properties = this.mxGraphService.graph
        .getOutgoingEdges(parent)
        .map(e => e.target)
        .filter(c => !!MxGraphHelper.getModelElement<DefaultProperty>(c)?.extends_);

      for (const property of properties) {
        MxGraphHelper.removeRelation(MxGraphHelper.getModelElement(parent), MxGraphHelper.getModelElement(property));
      }

      toRemove.push(...properties);
    }

    this.mxGraphService.removeCells(toRemove);
    const source = MxGraphHelper.getModelElement<DefaultEntity>(edge.source);
    source.extends_ = null;
    MxGraphHelper.updateLabel(edge.source, this.mxGraphService.graph, this.sammLangService);
    return true;
  }

  private handleAbstractPropertyRemoval(edge: mxgraph.mxCell, source: NamedElement, target: NamedElement) {
    if (
      (source instanceof DefaultProperty && target instanceof DefaultProperty && target.isAbstract) ||
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

  private handleAbstractElementsDecoupling(edge: mxgraph.mxCell, source: NamedElement, target: NamedElement) {
    if (
      (source instanceof DefaultEntity && target instanceof DefaultEntity && target.isAbstractEntity()) ||
      (source instanceof DefaultEntity && source.isAbstractEntity() && target instanceof DefaultEntity && target.isAbstractEntity()) ||
      (source instanceof DefaultEntity && target instanceof DefaultEntity) ||
      (source instanceof DefaultProperty && source.isAbstract && target instanceof DefaultProperty && target.isAbstract)
    ) {
      source.extends_ = null;
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

  private handleEntityPropertyDecoupling(edge: mxgraph.mxCell, source: NamedElement, target: NamedElement) {
    if (source instanceof DefaultEntity && target instanceof DefaultProperty) {
      if (target.extends_) {
        this.mxGraphService.removeCells([edge.target]);
      }

      this.entityInstanceService.onPropertyRemove(target, () => {
        this.removeConnectionBetweenElements(edge, source, target);
        this.mxGraphService.removeCells([edge]);
      });

      return true;
    }

    return false;
  }

  private handleEnumerationEntityDecoupling(edge: mxgraph.mxCell, source: NamedElement, target: NamedElement) {
    if (source instanceof DefaultEnumeration && target instanceof DefaultEntity) {
      return this.entityInstanceService.onEntityDisconnect(source, target, () => {
        const obsoleteEntityValues = MxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
        this.removeConnectionBetweenElements(edge, source, target);
        this.mxGraphService.updateEntityValuesWithCellReference(obsoleteEntityValues);
        this.mxGraphService.removeCells([edge, ...obsoleteEntityValues]);
      });
    }

    return false;
  }

  private removeConnectionBetweenElements(edge: mxgraph.mxCell, source: NamedElement, target: NamedElement) {
    if (MxGraphHelper.isComplexEnumeration(source)) {
      this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
    }
    MxGraphHelper.removeRelation(source, target);
    useUpdater(source).delete(target);
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
    sourceModelElement: NamedElement,
    targetModelElement: NamedElement,
    edge: mxgraph.mxCell,
  ): void {
    if (sourceModelElement instanceof DefaultEnumeration && targetModelElement instanceof DefaultEntityInstance) {
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
      if (!(parent instanceof NamedElement)) continue;
      MxGraphHelper.removeRelation(parent, modelElement);
    }

    for (const child of modelElement.children) {
      if (!(child instanceof NamedElement)) continue;
      MxGraphHelper.removeRelation(modelElement, child);
    }

    elementModelService?.delete(cell);
    this.currentCachedFile.removeElement(MxGraphHelper.getModelElement(cell).aspectModelUrn);
  }
}
