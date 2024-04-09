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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {
  BaseMetaModelElement,
  DefaultAbstractProperty,
  DefaultEntityInstance,
  DefaultProperty,
  Entity,
  EntityValueProperty,
  OverWrittenProperty,
} from '@ame/meta-model';
import {BaseModelService} from './base-model-service';
import {EntityValueRenderService, MxGraphHelper} from '@ame/mx-graph';

@Injectable({providedIn: 'root'})
export class EntityValueModelService extends BaseModelService {
  constructor(private entityValueRenderService: EntityValueRenderService) {
    super();
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEntityInstance;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}): void {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntityInstance>(cell);
    // update name
    const aspectModelUrn = this.modelService.currentRdfModel.getAspectModelUrn();
    this.currentCachedFile.updateCachedElementKey(`${aspectModelUrn}${modelElement.name}`, `${aspectModelUrn}${form.name}`);
    modelElement.name = form.name;
    modelElement.aspectModelUrn = `${aspectModelUrn}${form.name}`;

    // in case some entity values are no longer assigned as property values to the current entity, remove them from the model
    this.removeObsoleteEntityValues(modelElement);

    const newEntityValues = form.newEntityValues;
    // check if there are any new entity values to add to the cache service
    if (newEntityValues) {
      this.addNewEntityValues(newEntityValues, modelElement);
    }

    this.updatePropertiesEntityValues(modelElement, form);
    this.entityValueRenderService.update({cell, form});
  }

  delete(cell: mxgraph.mxCell): void {
    super.delete(cell);
    this.entityValueRenderService.delete(cell);
  }

  private updatePropertiesEntityValues(metaModelElement: DefaultEntityInstance, form: {[key: string]: any}): void {
    const {entityValueProperties} = form;
    metaModelElement.properties = [];

    Object.keys(entityValueProperties).forEach(key => {
      const property = this.findPropertyInEntities(this.currentCachedFile.getCachedEntities(), key);

      if (!property) return;

      const propertyValues = entityValueProperties[key].map(({value, language}) => ({
        key: property,
        value,
        language,
      }));

      metaModelElement.properties.push(...propertyValues);
    });
  }

  private findPropertyInEntities(
    entities: Array<Entity>,
    propertyName: string,
  ): OverWrittenProperty<DefaultProperty | DefaultAbstractProperty> {
    for (const entity of entities) {
      const property = entity.properties.find(prop => prop.property.name === propertyName);
      if (property) {
        return property;
      }
    }

    return null;
  }

  private removeObsoleteEntityValues(metaModelElement: DefaultEntityInstance): void {
    metaModelElement.properties.forEach((property: EntityValueProperty) => {
      if (property.value instanceof DefaultEntityInstance && !property.value.parents?.length) {
        this.deleteEntityValue(property.value, metaModelElement);
      }
    });
  }
}
