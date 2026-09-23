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

import {CacheUtils} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {
  CharacteristicRenderService,
  EnumerationRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
} from '@ame/max-graph';
import {RdfModelUtil} from '@ame/rdf/utils';
import {config, simpleDataTypes} from '@ame/shared';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
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
  DefaultValue,
  Entity,
  NamedElement,
  ScalarValue,
  Type,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class CharacteristicModelService extends BaseModelService {
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly characteristicRenderer = inject(CharacteristicRenderService);
  private readonly enumerationRenderer = inject(EnumerationRenderService);
  private readonly filtersService = inject(FiltersService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultCharacteristic;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const originalModelElement = MaxGraphHelper.getModelElement(cell);
    const {metaModelElement, cell: newCell} = this.onChangedMetaModel(cell, form);

    if (!metaModelElement) {
      return;
    }

    cell = newCell;
    // apply the update for the base fields (name, description, preferred name)
    super.update(cell, form);

    const oldDataType = metaModelElement.dataType;

    // if datatype has changed
    this.updateDatatype(metaModelElement, form);

    if (metaModelElement.dataType) {
      if (metaModelElement instanceof DefaultEnumeration && metaModelElement.values) {
        metaModelElement.values.forEach(v => {
          if (v instanceof DefaultValue && !this.loadedFilesService.isElementExtern(v)) {
            v.type = metaModelElement.dataType;
          }
        });
      }
      this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null)?.forEach(edge => {
        const targetModel = MaxGraphHelper.getModelElement(edge.target);
        if (targetModel instanceof DefaultValue && !this.loadedFilesService.isElementExtern(targetModel)) {
          targetModel.type = metaModelElement.dataType;
          this.maxgraphAttributeService.graph.labelChanged(edge.target, MaxGraphHelper.createPropertiesLabel(edge.target), null);
        }
      });
    }

    // remove old entity dependency if changed
    if (oldDataType instanceof DefaultEntity && oldDataType !== metaModelElement.dataType) {
      this.removeEntityDependency(cell, oldDataType);
    }

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

  delete(cell: Cell): void {
    super.delete(cell);
    const elementModel = MaxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    this.removePredefinedUnit(outgoingEdges);
    this.maxgraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.maxgraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.maxgraphService.removeCells([cell]);
  }

  private removePredefinedUnit(edges: Array<Cell>) {
    edges.forEach(edge => {
      const metaModelElement = MaxGraphHelper.getModelElement(edge.target);
      if (metaModelElement instanceof DefaultUnit && metaModelElement.isPredefined) {
        this.maxgraphService.removeCells([edge.target]);
      }
    });
  }

  private onChangedMetaModel(cell: Cell, form: {[key: string]: any}) {
    let metaModelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    if (form.changedMetaModel) {
      this.changeMetaModel(metaModelElement, form, cell);
      const originalModelElement = metaModelElement;
      metaModelElement = form.changedMetaModel;

      if (!metaModelElement.isPredefined) {
        cell = this.maxgraphService.resolveCellByModelElement(metaModelElement) || cell;
      }

      if (!(metaModelElement instanceof DefaultEnumeration)) {
        this.removeUnusedEntityValues(metaModelElement);
      }

      if (RdfModelUtil.isCharacteristicInstance(form.changedMetaModel.aspectModelUrn, this.loadedFile?.rdfModel?.sammC)) {
        // in case this is a predefined characteristic, no need to update anything
        const children = [...(originalModelElement.children || [])];
        for (const child of children) {
          MaxGraphHelper.removeRelation(originalModelElement, child);
        }
        this.characteristicRenderer.update({cell, form});
        return {};
      }
    }
    return {metaModelElement, cell};
  }

  private handleStructuredValue(cell: Cell, form: {[key: string]: any}) {
    const metaModelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
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
          MaxGraphHelper.establishRelation(metaModelElement, element);
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

  private removeEntityDependency(cell: Cell, oldEntity?: DefaultEntity) {
    const parentModel = MaxGraphHelper.getModelElement(cell);
    const edgesToRemove: Cell[] = [];
    (this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null) || []).forEach(edge => {
      const modelElement = MaxGraphHelper.getModelElement(edge.target);
      if (
        (modelElement instanceof DefaultEntity && (!oldEntity || modelElement.aspectModelUrn === oldEntity.aspectModelUrn)) ||
        modelElement instanceof DefaultEntityInstance
      ) {
        MaxGraphHelper.removeRelation(parentModel, modelElement);
        useUpdater(parentModel).delete(modelElement);
        if (modelElement instanceof DefaultEntityInstance) {
          this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
        }
        edgesToRemove.push(edge);
      }
    });
    if (edgesToRemove.length) {
      this.maxgraphService.removeCells(edgesToRemove);
    }
  }

  private updateParentModel(cell: Cell, value: any, oldModel?: NamedElement) {
    this.maxgraphAttributeService.graph.getIncomingEdges(cell, null).forEach(edgeToParent => {
      const modelElementParent = MaxGraphHelper.getModelElement<NamedElement>(edgeToParent.source);
      if (modelElementParent) {
        if (oldModel) {
          MaxGraphHelper.removeRelation(modelElementParent, oldModel);
          MaxGraphHelper.establishRelation(modelElementParent, value);
        }
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
      this.updateComplexEnumeration(metaModelElement, form);
    } else if (metaModelElement instanceof DefaultEnumeration) {
      form.enumValues
        .filter((v: ScalarValue | DefaultValue) => v instanceof DefaultValue)
        .forEach((value: DefaultValue) => {
          if (!this.loadedFilesService.isElementExtern(value)) {
            if (metaModelElement.dataType) {
              value.type = metaModelElement.dataType;
            }
            this.currentCachedFile.addElement(value.aspectModelUrn, value);
          }
        });
      metaModelElement.values = (form.enumValues || []).map((v: ScalarValue | DefaultValue) => {
        if (v instanceof ScalarValue) {
          v.type = metaModelElement.dataType || null;
        } else if (v instanceof DefaultValue && !this.loadedFilesService.isElementExtern(v) && metaModelElement.dataType) {
          v.type = metaModelElement.dataType;
        }
        return v;
      });
    } else if (metaModelElement instanceof DefaultCollection) {
      metaModelElement.elementCharacteristic = form.elementCharacteristic || null;
      if (form.elementCharacteristic) {
        metaModelElement.dataType = null;
        this.currentCachedFile.resolveInstance(form.elementCharacteristic);
        MaxGraphHelper.establishRelation(metaModelElement, form.elementCharacteristic);
      } else if (
        metaModelElement.dataType &&
        originalModelElement instanceof DefaultCollection &&
        originalModelElement.elementCharacteristic
      ) {
        MaxGraphHelper.removeRelation(metaModelElement, originalModelElement.elementCharacteristic);
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
        MaxGraphHelper.removeRelation(metaModelElement, metaModelElement.unit);
      }
    }

    if (originalModelElement?.unit) {
      MaxGraphHelper.removeRelation(originalModelElement, originalModelElement.unit);
    }

    metaModelElement.unit = form.unit;
    if (form.unit instanceof DefaultUnit) {
      MaxGraphHelper.establishRelation(metaModelElement, form.unit);
    }

    if (form.unit && !form.unit?.isPredefined) {
      this.currentCachedFile.resolveInstance(form.unit);
    }
  }

  private updateDatatype(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}) {
    if (metaModelElement instanceof DefaultCollection && form.elementCharacteristic) {
      metaModelElement.dataType = null;
      return;
    }

    if (form.newDataType) {
      metaModelElement.dataType = form.newDataType;
      // TODO get a way to signal is made in editor
      // metaModelElement.createdFromEditor = true;
      this.currentCachedFile.resolveInstance(form.newDataType);
    } else if (form.dataTypeEntity) {
      metaModelElement.dataType = form.dataTypeEntity;
      if (form.dataTypeEntity instanceof DefaultEntity && !this.loadedFilesService.isElementExtern(form.dataTypeEntity)) {
        this.currentCachedFile.resolveInstance(form.dataTypeEntity);
      }
    } else if (form.scalarDataType) {
      metaModelElement.dataType = form.scalarDataType;
    } else if (typeof form.dataType === 'string' && form.dataType.trim()) {
      const rawName = form.dataType.trim();
      const simpleType = (simpleDataTypes as Record<string, any>)[rawName];
      if (simpleType) {
        metaModelElement.dataType = new DefaultScalar({
          urn: simpleType.isDefinedBy,
          descriptions: new Map([['en', simpleType.description || '']]),
          metaModelVersion: config.currentSammVersion,
        });
      } else {
        const found =
          this.currentCachedFile.get<Type>(rawName) ||
          this.currentCachedFile.filter<DefaultEntity>(e => e instanceof DefaultEntity && e.name === rawName)?.[0] ||
          this.loadedFilesService.findElementOnExtReferences<Entity>(rawName);
        if (found) {
          metaModelElement.dataType = found;
        } else {
          if (/^[A-Z]/.test(rawName)) {
            const urn = `${metaModelElement.aspectModelUrn.split('#')?.[0]}#${rawName}`;
            const newEntity = new DefaultEntity({
              metaModelVersion: metaModelElement.metaModelVersion,
              aspectModelUrn: urn,
              name: rawName,
            });
            this.currentCachedFile.resolveInstance(newEntity);
            metaModelElement.dataType = newEntity;
          } else {
            metaModelElement.dataType = new DefaultScalar({
              urn: rawName,
              metaModelVersion: config.currentSammVersion,
            });
          }
        }
      }
    } else if ('dataType' in form || 'dataTypeEntity' in form) {
      metaModelElement.dataType = null;
    }
  }

  private updateComplexEnumeration(metaModelElement: DefaultEnumeration, form: {[key: string]: any}) {
    const deletedEntityValues: DefaultEntityInstance[] = form.deletedEntityValues || [];
    deletedEntityValues.forEach(entityValue => this.deleteEntityValue(entityValue, metaModelElement));

    // create new entity values (add to cache service)
    this.addNewEntityValues(form.chipList || [], metaModelElement);
    metaModelElement.values = [...form.chipList];
  }

  private changeMetaModel(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}, cell: Cell) {
    this.updateParentModel(cell, form.changedMetaModel, metaModelElement);
    this.updateModelElementCache(metaModelElement, form.changedMetaModel);
    MaxGraphHelper.setElementNode(cell, this.filtersService.createNode(form.changedMetaModel));
  }
}
