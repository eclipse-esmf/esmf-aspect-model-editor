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

import {EntityValueRenderService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, NamedElement, Value} from '@esmf/aspect-model-loader';
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

    this.updateEntityInstanceWithSimpleValues(modelElement, form);
    this.removeUnusedEntityInstances(modelElement, form);
    this.updateWithEntityInstances(modelElement, form);

    this.entityValueRenderService.update({cell, form});
  }

  private removeUnusedEntityInstances(entityInstance: DefaultEntityInstance, form: {[key: string]: any}): void {
    const {entityValueProperties} = form;

    // remove obsolete entity values
    const properties = entityInstance.type?.properties || [];
    for (const property of properties) {
      if (!(property.characteristic?.dataType instanceof DefaultEntity)) continue;

      const actualValues: DefaultEntityInstance[] = entityInstance.assertions.get(property.aspectModelUrn) || ([] as any);
      const updatedValues = entityValueProperties[property.name] || [];
      const filteredValues = actualValues.filter(entityInstance => updatedValues.some(({value}) => value === entityInstance.name));
      entityInstance.assertions.set(property.aspectModelUrn, filteredValues);
    }
  }

  private updateWithEntityInstances(entityInstance: DefaultEntityInstance, form: {[key: string]: any}): void {
    const {newEntityValues, entityValueProperties} = form;
    const properties = entityInstance.type?.properties || [];

    for (const property of properties) {
      if (!(property.characteristic?.dataType instanceof DefaultEntity)) continue;

      const values = entityValueProperties[property.name] || [];
      for (const {value} of values) {
        // add new entity instance is it was created in the form
        if (newEntityValues?.length) {
          const entityInstance: DefaultEntityInstance = newEntityValues.find((ei: DefaultEntityInstance) => ei.name === value);
          if (entityInstance) {
            entityInstance.setAssertion(property.aspectModelUrn, entityInstance);
            this.loadedFile.cachedFile.resolveInstance(entityInstance);
          }
        }

        // add existing entity instance if it was selected in the form
        const createdEntityInstances: DefaultEntityInstance[] = entityInstance.assertions.get(property.aspectModelUrn) || ([] as any);
        if (!createdEntityInstances.some(ev => ev.name === value)) {
          const cachedEntityInstance = this.loadedFile.cachedFile
            .getByName<DefaultEntityInstance>(value)
            .filter(ev => ev instanceof DefaultEntityInstance)[0];
          if (cachedEntityInstance) entityInstance.setAssertion(property.aspectModelUrn, cachedEntityInstance);
        }
      }
    }
  }

  private updateEntityInstanceWithSimpleValues(entityInstance: DefaultEntityInstance, form: {[key: string]: any}) {
    const {entityValueProperties} = form;
    const properties = entityInstance.type?.properties || [];
    for (const property of properties) {
      if (property.characteristic?.dataType instanceof DefaultEntity) continue;
      entityInstance.assertions.set(property.aspectModelUrn, []);

      const values = entityValueProperties[property.name] || [];
      for (const {value, language} of values) {
        entityInstance.setAssertion(property.aspectModelUrn, new Value(value, property.characteristic?.dataType, language));
      }
    }
  }

  delete(cell: mxgraph.mxCell): void {
    super.delete(cell);
    this.entityValueRenderService.delete(cell);
  }
}
