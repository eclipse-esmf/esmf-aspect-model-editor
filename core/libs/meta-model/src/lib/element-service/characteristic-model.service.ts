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

import {CacheUtils} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {
  CharacteristicRenderService,
  EnumerationRenderService,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
} from '@ame/mx-graph';
import {RdfModelUtil} from '@ame/rdf/utils';
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultCollection,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultState,
  DefaultStructuredValue,
  DefaultUnit,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class CharacteristicModelService extends BaseModelService {
  constructor(
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private characteristicRenderer: CharacteristicRenderService,
    private enumerationRenderer: EnumerationRenderService,
    private filtersService: FiltersService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultCharacteristic;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const originalModelElement = MxGraphHelper.getModelElement(cell);
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

    this.updateFields(metaModelElement, form, originalModelElement);
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
    const elementModel = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.removePredefinedUnit(outgoingEdges);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.mxGraphService.removeCells([cell]);
  }

  private removePredefinedUnit(edges: Array<mxgraph.mxCell>) {
    edges.forEach(edge => {
      const metaModelElement = MxGraphHelper.getModelElement(edge.target);
      if (metaModelElement instanceof DefaultUnit && metaModelElement.isPredefined) {
        this.mxGraphService.removeCells([edge.target]);
      }
    });
  }

  private onChangedMetaModel(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    let metaModelElement = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (form.changedMetaModel) {
      this.changeMetaModel(metaModelElement, form, cell);
      const originalModelElement = metaModelElement;
      metaModelElement = form.changedMetaModel;

      if (!metaModelElement.isPredefined) {
        cell = this.mxGraphService.resolveCellByModelElement(metaModelElement);
      }

      if (!(metaModelElement instanceof DefaultEnumeration)) {
        this.removeUnusedEntityValues(metaModelElement);
      }

      if (RdfModelUtil.isCharacteristicInstance(form.changedMetaModel.aspectModelUrn, this.loadedFile?.rdfModel?.sammC)) {
        // in case this is a predefined characteristic, no need to update anything
        const children = [...(originalModelElement.children || [])];
        for (const child of children) {
          MxGraphHelper.removeRelation(originalModelElement, child);
        }
        this.characteristicRenderer.update({cell, form});
        return {};
      }
    }
    return {metaModelElement, cell};
  }

  private handleStructuredValue(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (!(metaModelElement instanceof DefaultStructuredValue)) {
      return;
    }

    if (form.deconstructionRule) {
      metaModelElement.deconstructionRule = form.deconstructionRule;
    }

    if (form.elements) {
      metaModelElement.elements = form.elements;
      form.elements.forEach(element => {
        if (typeof element !== 'string' && element instanceof DefaultProperty) {
          this.currentCachedFile.resolveInstance(element);
          MxGraphHelper.establishRelation(metaModelElement, element);
          if (element.characteristic) {
            this.currentCachedFile.resolveInstance(element.characteristic);
          }
        }
      });
    }
  }

  private removeUnusedEntityValues(metaModelElement: NamedElement) {
    const unusedEntityValues = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance).filter(
      ev => ev.parents?.length <= 1 && ev.parents?.some(parent => parent.aspectModelUrn === metaModelElement.aspectModelUrn),
    );

    for (const ev of unusedEntityValues) {
      this.currentCachedFile.removeElement(ev.aspectModelUrn);
    }
  }

  private removeEntityDependency(cell: mxgraph.mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      if (modelElement instanceof DefaultEntityInstance) {
        MxGraphHelper.removeRelation(MxGraphHelper.getModelElement(cell), modelElement);
        this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
      }
    });
  }

  private updateParentModel(cell: mxgraph.mxCell, value: any, oldModel?: NamedElement) {
    this.mxGraphAttributeService.graph.getIncomingEdges(cell).forEach(edgeToParent => {
      const modelElementParent = MxGraphHelper.getModelElement<NamedElement>(edgeToParent.source);
      if (modelElementParent) {
        MxGraphHelper.removeRelation(modelElementParent, oldModel);
        MxGraphHelper.establishRelation(modelElementParent, value);
        useUpdater(modelElementParent).update(value);
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
    this.currentCachedFile.removeElement(oldValue?.aspectModelUrn);
    if (!newValue?.isPredefined) {
      this.currentCachedFile.resolveInstance(newValue);
    }
  }

  private updateFields(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}, originalModelElement?: NamedElement) {
    if (metaModelElement instanceof DefaultQuantifiable) {
      this.handleQuantifiableUnit(metaModelElement, form, originalModelElement as DefaultQuantifiable);
    } else if (metaModelElement instanceof DefaultEnumeration && metaModelElement.dataType instanceof DefaultEntity) {
      // complex enumeration
      // TODO get a way to signal is made in editor
      // metaModelElement.createdFromEditor = true;
      this.updateComplexEnumeration(metaModelElement, form);
    } else if (metaModelElement instanceof DefaultEnumeration) {
      // simple enumeration
      metaModelElement.values = form.enumValues.map(value => value.name) || null;
    } else if (metaModelElement instanceof DefaultCollection) {
      metaModelElement.elementCharacteristic = form.elementCharacteristic;
      if (form.elementCharacteristic) {
        this.currentCachedFile.resolveInstance(form.elementCharacteristic);
        MxGraphHelper.establishRelation(metaModelElement, form.elementCharacteristic);
      }
    }
  }

  private handleQuantifiableUnit(
    metaModelElement: DefaultQuantifiable,
    form: {[key: string]: any},
    originalModelElement?: DefaultQuantifiable,
  ) {
    if (metaModelElement.unit) {
      if (
        metaModelElement.unit?.aspectModelUrn !== form.unit?.aspectModelUrn ||
        metaModelElement.className !== originalModelElement.className
      ) {
        MxGraphHelper.removeRelation(metaModelElement, metaModelElement.unit);
      }
    }

    if (originalModelElement?.unit) {
      MxGraphHelper.removeRelation(originalModelElement, originalModelElement.unit);
    }

    metaModelElement.unit = form.unit;
    if (form.unit instanceof DefaultUnit) {
      MxGraphHelper.establishRelation(metaModelElement, form.unit);
    }

    if (form.unit && !form.unit?.isPredefined) {
      this.currentCachedFile.resolveInstance(form.unit);
    }
  }

  private updateDatatype(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}) {
    if (form.newDataType) {
      metaModelElement.dataType = form.newDataType;
      // TODO get a way to signal is made in editor
      // metaModelElement.createdFromEditor = true;
      this.currentCachedFile.resolveInstance(form.newDataType);
    }

    if (form.scalarDataType) {
      metaModelElement.dataType = form.scalarDataType;
    }

    if (form.dataTypeEntity) {
      metaModelElement.dataType = form.dataTypeEntity;
    }
  }

  private updateComplexEnumeration(metaModelElement: DefaultEnumeration, form: {[key: string]: any}) {
    const deletedEntityValues: DefaultEntityInstance[] = form.deletedEntityValues || [];
    deletedEntityValues.forEach(entityValue => this.deleteEntityValue(entityValue, metaModelElement));

    // create new entity values (add to cache service)
    this.addNewEntityValues(form.chipList || [], metaModelElement);
    metaModelElement.values = [...form.chipList];
  }

  private changeMetaModel(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}, cell: mxgraph.mxCell) {
    this.updateParentModel(cell, form.changedMetaModel, metaModelElement);
    this.updateModelElementCache(metaModelElement, form.changedMetaModel);
    MxGraphHelper.setElementNode(cell, this.filtersService.createNode(form.changedMetaModel));
  }
}
