/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {DataFactory, NamedNode, Quad, Quad_Object, Util} from 'n3';
import {DefaultEntity, DefaultEntityValue, Entity, OverWrittenProperty} from '@ame/meta-model';
import {EntityInstantiator} from './entity-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Samm} from '@ame/vocabulary';
import {syncElementWithChildren} from '../helpers';

export class EntityValueInstantiator {
  private samm: Samm = this.metaModelElementInstantiator.samm;

  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  private get namespaceCacheService() {
    return this.metaModelElementInstantiator.namespaceCacheService;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  createEntityValue(quads: Quad[], object: Quad_Object) {
    if (!quads.length) {
      const {externalReference} = this.metaModelElementInstantiator.getExternalElement<DefaultEntityValue>(object);
      if (externalReference) {
        return externalReference;
      }
    }

    const subject = quads[0].subject.value;
    const cachedElement = this.cachedFile.getElement<DefaultEntityValue>(subject);
    if (cachedElement) {
      return cachedElement;
    }

    const defaultEntityValue = new DefaultEntityValue(null, null, null, null, []);
    defaultEntityValue.name = subject.split('#')?.[1];
    defaultEntityValue.aspectModelUrn = subject;
    defaultEntityValue.entity = this.getEntity(quads) as DefaultEntity;
    defaultEntityValue.fileName = this.metaModelElementInstantiator.fileName;
    defaultEntityValue.setExternalReference(this.rdfModel.isExternalRef);

    if (defaultEntityValue.entity) defaultEntityValue.children.push(defaultEntityValue.entity);

    // saving into cache earlier to prevent infinite loop
    this.cachedFile.resolveElement(defaultEntityValue);

    const properties = quads.filter(({predicate}) => !this.samm.RdfType().equals(predicate));
    for (const property of properties) {
      if (Util.isLiteral(property.object)) {
        this.metaModelElementInstantiator.getProperty({quad: property.predicate}, (overwrittenProperty: OverWrittenProperty) => {
          defaultEntityValue.addProperty(overwrittenProperty, property.object.value);
          syncElementWithChildren(defaultEntityValue);
        });
        continue;
      }

      const value = this.cachedFile.getElement<DefaultEntityValue>(property.object.value);

      if (value) {
        this.metaModelElementInstantiator.getProperty({quad: property.predicate}, (overwrittenProperty: OverWrittenProperty) => {
          defaultEntityValue.addProperty(overwrittenProperty, value);
          syncElementWithChildren(defaultEntityValue);
        });
      } else {
        this.metaModelElementInstantiator.addInstantiatorFunctionToQueue(
          this.instantiateEntityValue.bind(this, property, defaultEntityValue)
        );
      }
    }

    return this.cachedFile.resolveElement(defaultEntityValue);
  }

  private instantiateEntityValue(property: Quad, defaultEntityValue: DefaultEntityValue) {
    const value = new EntityValueInstantiator(this.metaModelElementInstantiator).createEntityValue(
      this.metaModelElementInstantiator.rdfModel.findAnyProperty(property.object as NamedNode),
      property.object
    );
    this.metaModelElementInstantiator.getProperty({quad: property.predicate}, (overwrittenProperty: OverWrittenProperty) => {
      defaultEntityValue.addProperty(overwrittenProperty, value);
    });
  }

  private getEntity(quads: Quad[]): Entity {
    const quad = quads.find(({predicate}) => this.samm.RdfType().equals(predicate));
    if (!quad) {
      return null;
    }
    const entity = this.namespaceCacheService.findElementOnExtReference<Entity>(quad.object.value);
    if (entity) {
      return entity;
    }

    return (
      this.cachedFile.getElement(quad.object.value) ||
      new EntityInstantiator(this.metaModelElementInstantiator).createEntity(
        this.metaModelElementInstantiator.rdfModel.findAnyProperty(DataFactory.namedNode(quad.object.value))
      )
    );
  }
}
