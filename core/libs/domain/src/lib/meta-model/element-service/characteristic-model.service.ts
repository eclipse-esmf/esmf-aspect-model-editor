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
import {RdfModelUtil} from '@ame/rdf';
import {config, ElementRelationUtil, simpleDataTypes, useUpdater} from '@ame/shared';
import {Injectable} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultCollection,
  DefaultEither,
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
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class CharacteristicModelService extends BaseModelService {
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultCharacteristic;
  }

  update(cell: any, form: {[key: string]: any}) {
    const originalModelElement = ElementRelationUtil.getModelElement(cell);
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
      (this.graphAdapter?.getOutgoingEdges(cell) || []).forEach(edge => {
        const targetModel = ElementRelationUtil.getModelElement(edge.target);
        if (targetModel instanceof DefaultValue && !this.loadedFilesService.isElementExtern(targetModel)) {
          targetModel.type = metaModelElement.dataType;
          this.graphAdapter?.setCellPropertiesLabel(edge.target);
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
    }
    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any): void {
    super.delete(cell);
    const elementModel = ElementRelationUtil.getModelElement(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    this.removePredefinedUnit(outgoingEdges);
    this.graphAdapter?.checkAndAddTopShapeActionIcon(outgoingEdges, elementModel);
    this.graphAdapter?.checkAndAddShapeActionIcon(incomingEdges, elementModel);
    this.graphAdapter?.removeCells([cell]);
  }

  private removePredefinedUnit(edges: Array<any>) {
    edges.forEach(edge => {
      const metaModelElement = ElementRelationUtil.getModelElement(edge.target);
      if (metaModelElement instanceof DefaultUnit && metaModelElement.isPredefined) {
        this.graphAdapter?.removeCells([edge.target]);
      }
    });
  }

  private onChangedMetaModel(cell: any, form: {[key: string]: any}) {
    let metaModelElement = ElementRelationUtil.getModelElement<DefaultCharacteristic>(cell);
    if (form.changedMetaModel) {
      this.changeMetaModel(metaModelElement, form, cell);
      const originalModelElement = metaModelElement;
      metaModelElement = form.changedMetaModel;

      if (!metaModelElement.isPredefined) {
        cell = this.graphAdapter?.resolveCellByModelElement(metaModelElement) || cell;
      }

      if (!(metaModelElement instanceof DefaultEnumeration)) {
        this.removeUnusedEntityValues(metaModelElement);
      }

      if (RdfModelUtil.isCharacteristicInstance(form.changedMetaModel.aspectModelUrn, this.loadedFile?.rdfModel?.sammC)) {
        // in case this is a predefined characteristic, no need to update anything
        const children = [...(originalModelElement.children || [])];
        for (const child of children) {
          ElementRelationUtil.removeRelation(originalModelElement, child);
        }
        this.graphAdapter?.updateCell(cell);
        return {};
      }
    }
    return {metaModelElement, cell};
  }

  private handleStructuredValue(cell: any, form: {[key: string]: any}) {
    const metaModelElement = ElementRelationUtil.getModelElement<DefaultCharacteristic>(cell);
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
          ElementRelationUtil.establishRelation(metaModelElement, element);
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

  private removeEntityDependency(cell: any, oldEntity?: DefaultEntity) {
    const parentModel = ElementRelationUtil.getModelElement(cell);
    const edgesToRemove: any[] = [];
    (this.graphAdapter?.getOutgoingEdges(cell) || []).forEach(edge => {
      const modelElement = ElementRelationUtil.getModelElement(edge.target);
      if (
        (modelElement instanceof DefaultEntity && (!oldEntity || modelElement.aspectModelUrn === oldEntity.aspectModelUrn)) ||
        modelElement instanceof DefaultEntityInstance
      ) {
        ElementRelationUtil.removeRelation(parentModel, modelElement);
        useUpdater(parentModel).delete(modelElement);
        if (modelElement instanceof DefaultEntityInstance) {
          this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
        }
        edgesToRemove.push(edge);
      }
    });
    if (edgesToRemove.length) {
      this.graphAdapter?.removeCells(edgesToRemove);
    }
  }

  private updateParentModel(cell: any, value: any, oldModel?: NamedElement) {
    (this.graphAdapter?.getIncomingEdges(cell) || []).forEach(edgeToParent => {
      const modelElementParent = ElementRelationUtil.getModelElement<NamedElement>(edgeToParent.source);
      if (modelElementParent) {
        if (oldModel) {
          ElementRelationUtil.removeRelation(modelElementParent, oldModel);
          ElementRelationUtil.establishRelation(modelElementParent, value);
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
      metaModelElement.elementCharacteristic = form.elementCharacteristic;
      if (form.elementCharacteristic) {
        this.currentCachedFile.resolveInstance(form.elementCharacteristic);
        ElementRelationUtil.establishRelation(metaModelElement, form.elementCharacteristic);
      }
    } else if (metaModelElement instanceof DefaultEither) {
      metaModelElement.left = form.leftCharacteristic;
      metaModelElement.right = form.rightCharacteristic;
      if (form.leftCharacteristic) {
        this.currentCachedFile.resolveInstance(form.leftCharacteristic);
        ElementRelationUtil.establishRelation(metaModelElement, form.leftCharacteristic);
      }
      if (form.rightCharacteristic) {
        this.currentCachedFile.resolveInstance(form.rightCharacteristic);
        ElementRelationUtil.establishRelation(metaModelElement, form.rightCharacteristic);
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
        ElementRelationUtil.removeRelation(metaModelElement, metaModelElement.unit);
      }
    }

    if (originalModelElement?.unit) {
      ElementRelationUtil.removeRelation(originalModelElement, originalModelElement.unit);
    }

    metaModelElement.unit = form.unit;
    if (form.unit instanceof DefaultUnit) {
      ElementRelationUtil.establishRelation(metaModelElement, form.unit);
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
    } else {
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

  private changeMetaModel(metaModelElement: DefaultCharacteristic, form: {[key: string]: any}, cell: any) {
    this.updateParentModel(cell, form.changedMetaModel, metaModelElement);
    this.updateModelElementCache(metaModelElement, form.changedMetaModel);
    this.graphAdapter?.setElementFilterNode(cell, form.changedMetaModel);
  }
}
