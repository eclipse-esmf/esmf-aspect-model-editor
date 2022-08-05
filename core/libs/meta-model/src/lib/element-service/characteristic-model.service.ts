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

import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';
import {
  CharacteristicRenderService,
  EnumerationRenderService,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {mxgraph} from 'mxgraph-factory';
import {
  Base,
  BaseMetaModelElement,
  DefaultCollection,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultState,
  DefaultStructuredValue,
  DefaultUnit,
} from '../aspect-meta-model';
import {DefaultCharacteristic} from '../aspect-meta-model/default-characteristic';
import {DefaultEntity} from '../aspect-meta-model/default-entity';
import {BaseModelService} from './base-model-service';
import {EntityValueModelService} from '@ame/meta-model';

@Injectable({providedIn: 'root'})
export class CharacteristicModelService extends BaseModelService {
  constructor(
    namespaceCacheService: NamespacesCacheService,
    modelService: ModelService,
    protected mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected mxGraphService: MxGraphService,
    protected shapeConnectorService: ShapeConnectorService,
    protected entityValueModelService: EntityValueModelService,
    private characteristicRenderer: CharacteristicRenderService,
    private enumerationRenderer: EnumerationRenderService
  ) {
    super(namespaceCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultCharacteristic;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const {metaModelElement, cell: newCell} = this.onChangedMetaModel(cell, form);

    if (!metaModelElement) {
      return;
    }

    cell = newCell;
    // apply the update for the base fields (name, description, preferred name)
    super.update(cell, form);

    // remove the entity dependency from the current characteristic
    if ((form.newDataType || form.scalarDataType) && metaModelElement.dataType instanceof DefaultEntity) {
      this.removeEntityDependency(cell);
      this.updateParentModel(cell, form.newDataType);
    }

    // if datatype has changed
    this.updateDatatype(metaModelElement, form);
    this.handleStructuredValue(cell, form);

    this.updateFields(metaModelElement, form);
    if (metaModelElement instanceof DefaultEnumeration || metaModelElement instanceof DefaultState) {
      if (metaModelElement instanceof DefaultState) {
        metaModelElement.defaultValue = form.defaultValue;
      }
      this.enumerationRenderer.update({cell, form});
    } else {
      this.characteristicRenderer.update({cell, form});
    }
  }

  delete(cell: mxgraph.mxCell): void {
    super.delete(cell);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.removePredefinedUnit(outgoingEdges);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.mxGraphService.removeCells([cell]);
  }

  private removePredefinedUnit(edges: Array<mxgraph.mxCell>) {
    edges.forEach(edge => {
      const metaModelElement = MxGraphHelper.getModelElement(edge.target);
      if (metaModelElement instanceof DefaultUnit && metaModelElement.isPredefined()) {
        this.mxGraphService.removeCells([edge.target]);
      }
    });
  }

  private onChangedMetaModel(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    let metaModelElement: DefaultCharacteristic = MxGraphHelper.getModelElement(cell);
    if (form.changedMetaModel) {
      this.changeMetaModel(metaModelElement, form, cell);
      metaModelElement = form.changedMetaModel;

      if (!metaModelElement.isPredefined()) {
        cell = this.mxGraphService.resolveCellByModelElement(metaModelElement);
      }

      if (!(metaModelElement instanceof DefaultEnumeration)) {
        this.removeUnusedEntityValues(metaModelElement);
      }

      if (
        RdfModelUtil.isCharacteristicInstance(
          form.changedMetaModel.aspectModelUrn,
          this.modelService.getLoadedAspectModel().rdfModel.BAMMC()
        )
      ) {
        // in case this is a predefined characteristic, no need to update anything
        this.characteristicRenderer.update({cell, form});
        return {};
      }
    }
    return {metaModelElement, cell};
  }

  private handleStructuredValue(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultCharacteristic = MxGraphHelper.getModelElement(cell);
    if (!(metaModelElement instanceof DefaultStructuredValue)) {
      return;
    }

    if (form.deconstructionRule) {
      metaModelElement.deconstructionRule = form.deconstructionRule;
    }

    if (form.elements) {
      metaModelElement.elements = form.elements;
      form.elements.forEach(element => {
        if (typeof element !== 'string' && element?.property instanceof DefaultProperty) {
          this.namespacesCacheService.getCurrentCachedFile().resolveElement(element.property);
          if (element.property.characteristic) {
            this.namespacesCacheService.getCurrentCachedFile().resolveElement(element.property.characteristic);
          }
        }
      });
    }
  }

  private removeUnusedEntityValues(metaModelElement: BaseMetaModelElement) {
    const unusedEntityValues = this.namespacesCacheService
      .getCurrentCachedFile()
      .getCachedEntityValues()
      .filter(ev => ev.parents?.length <= 1 && ev.parents?.some(parent => parent.aspectModelUrn === metaModelElement.aspectModelUrn));

    for (const ev of unusedEntityValues) {
      this.namespacesCacheService.getCurrentCachedFile().removeCachedElement(ev.aspectModelUrn);
    }
  }

  private removeEntityDependency(cell: mxgraph.mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      if (modelElement instanceof DefaultEntityValue) {
        this.currentCachedFile.removeCachedElement(modelElement.aspectModelUrn);
      }
    });
  }

  private updateParentModel(cell: mxgraph.mxCell, value: any) {
    this.mxGraphAttributeService.graph.getIncomingEdges(cell).forEach(cellParent => {
      const modelElementParent = MxGraphHelper.getModelElement<Base>(cellParent.source);
      if (modelElementParent) {
        modelElementParent.update(value);
      }
    });
  }

  private updateModelElementCache(oldValue, newValue) {
    if (newValue instanceof DefaultScalar) {
      return;
    }
    if (!(oldValue instanceof DefaultCharacteristic)) {
      return;
    }
    this.currentCachedFile.removeCachedElement(oldValue?.aspectModelUrn);
    if (!newValue?.isPredefined()) {
      this.currentCachedFile.resolveCachedElement(newValue);
    }
  }

  private updateFields(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}) {
    if (metaModelElement instanceof DefaultQuantifiable) {
      metaModelElement.unit = form.unit;
      if (form.unit && !form.unit?.isPredefined()) {
        this.currentCachedFile.resolveCachedElement(form.unit);
      }
    } else if (metaModelElement instanceof DefaultEnumeration && metaModelElement.dataType instanceof DefaultEntity) {
      // complex enumeration
      this.updateComplexEnumeration(metaModelElement, form);
    } else if (metaModelElement instanceof DefaultEnumeration) {
      // simple enumeration
      metaModelElement.values = form.chipList.map(chip => chip.name) || null;
    } else if (metaModelElement instanceof DefaultCollection) {
      metaModelElement.elementCharacteristic = form.elementCharacteristic;
      if (form.elementCharacteristic) {
        this.namespacesCacheService.resolveCachedElement(form.elementCharacteristic);
      }
    }
  }

  private updateDatatype(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}) {
    if (form.newDataType) {
      metaModelElement.dataType = form.newDataType;
      metaModelElement.createdFromEditor = true;
      this.namespacesCacheService.resolveCachedElement(form.newDataType);
    }

    if (form.scalarDataType) {
      metaModelElement.dataType = form.scalarDataType;
    }

    if (form.dataTypeEntity) {
      metaModelElement.dataType = form.dataTypeEntity;
    }
  }

  private updateComplexEnumeration(metaModelElement: DefaultEnumeration, form: {[key: string]: any}) {
    const deletedEntityValues: DefaultEntityValue[] = form.deleteEntityValues || [];
    deletedEntityValues.forEach(entityValue => this.deleteEntityValue(entityValue));

    // create new entity values (add to cache service)
    this.addNewEntityValues(form.chipList || []);
    metaModelElement.values = [...form.chipList];
  }

  private changeMetaModel(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}, cell: mxgraph.mxCell) {
    this.updateParentModel(cell, form.changedMetaModel);
    this.updateModelElementCache(metaModelElement, form.changedMetaModel);
    MxGraphHelper.setModelElement(cell, form.changedMetaModel);
  }
}
