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

import {DataFactory, Quad} from 'n3';
import {DefaultAbstractEntity, DefaultEntity, Entity, OverWrittenProperty} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {AbstractEntityInstantiator} from './abstract-entity-instantiator';
import {PredefinedEntityInstantiator} from './samm-e-predefined-entity-instantiator';
import {syncElementWithChildren} from '../helpers';

export class EntityInstantiator {
  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  createEntity(quads: Array<Quad>): Entity {
    const entity = this.cachedFile.getElement<Entity>(quads[0]?.subject.value);

    if (entity) {
      return entity;
    }

    const samm = this.metaModelElementInstantiator.samm;
    const defaultEntity = new DefaultEntity(null, null, null, new Array<OverWrittenProperty>());

    defaultEntity.setExternalReference(this.rdfModel.isExternalRef);
    defaultEntity.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultEntity, this.metaModelElementInstantiator.rdfModel);

    const predefinedEntityInstantiator = new PredefinedEntityInstantiator(this.metaModelElementInstantiator);

    quads.forEach(quad => {
      if (samm.isExtendsProperty(quad.predicate.value)) {
        const externalElement = this.metaModelElementInstantiator.namespaceCacheService.findElementOnExtReference<DefaultAbstractEntity>(
          quad.object.value
        );

        if (externalElement) {
          defaultEntity.extendedElement = externalElement;
          defaultEntity.children.push(externalElement);
          return;
        }

        let storedQuads = this.rdfModel.store.getQuads(quad.object, null, null, null);
        const entityInstance = predefinedEntityInstantiator.entityInstances[quad.object.value];

        if (!storedQuads.length && !entityInstance) {
          storedQuads = this.metaModelElementInstantiator
            .getExternalElement(quad.object, this.rdfModel.isExternalRef)
            .externalRdfModel.store.getQuads(quad.object, null, null, null);
        }

        const isEntity = storedQuads.some(quad => samm.isEntity(quad.object.value));

        if (isEntity) {
          defaultEntity.extendedElement = this.createEntity(storedQuads) as DefaultEntity;
        } else if (entityInstance) {
          defaultEntity.extendedElement = entityInstance();
        } else {
          defaultEntity.extendedElement = new AbstractEntityInstantiator(this.metaModelElementInstantiator).createAbstractEntity(
            storedQuads
          );
        }

        if (defaultEntity.extendedElement) {
          defaultEntity.children.push(defaultEntity.extendedElement);
        }

        return;
      }

      if (samm.isPropertiesProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getProperties(
          DataFactory.namedNode(quad.subject.value),
          samm.PropertiesProperty(),
          defaultEntity
        );
      }
    });

    syncElementWithChildren(defaultEntity);
    return <Entity>this.cachedFile.resolveElement(defaultEntity);
  }
}
