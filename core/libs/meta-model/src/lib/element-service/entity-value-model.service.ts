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
import {EntityValueRenderService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultProperty, Entity, NamedElement, Value} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class EntityValueModelService extends BaseModelService {
  constructor(private entityValueRenderService: EntityValueRenderService) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEntityInstance;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}): void {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntityInstance>(cell);
    // update name
    const aspectModelUrn = this.loadedFile?.rdfModel?.getAspectModelUrn();
    this.currentCachedFile.updateElementKey(`${aspectModelUrn}${modelElement.name}`, `${aspectModelUrn}${form.name}`);
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

  private updatePropertiesEntityValues(entityInstance: DefaultEntityInstance, form: {[key: string]: any}): void {
    const {entityValueProperties} = form;

    entityInstance.assertions = new Map();
    Object.keys(entityValueProperties).forEach(key => {
      const property = this.findPropertyInEntities(CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntity), key);
      if (!property) return;

      entityValueProperties[key].map(({value, language}) => {
        entityInstance.removeAssertionLanguage(property.aspectModelUrn, language);
        entityInstance.setAssertion(property.aspectModelUrn, new Value(value, property.characteristic?.dataType, language));
      });
    });
  }

  private findPropertyInEntities(entities: Array<Entity>, propertyName: string): DefaultProperty {
    for (const entity of entities) {
      const property = entity.properties.find(prop => prop.name === propertyName);
      if (property) return property;
    }

    return null;
  }

  private removeObsoleteEntityValues(metaModelElement: DefaultEntityInstance): void {
    metaModelElement.getTuples().forEach(([, value]) => {
      if (value instanceof DefaultEntityInstance) {
        this.deleteEntityValue(value, metaModelElement);
      }
    });
  }
}
