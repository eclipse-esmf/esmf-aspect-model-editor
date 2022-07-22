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

import {DataFactory, Quad} from 'n3';
import {DefaultEntity, Entity, OverWrittenProperty} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {AbstractEntityInstantiator} from './abstract-entity-instantiator';

export class EntityInstantiator {
  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  createEntity(quads: Array<Quad>): Entity {
    const entity = this.cachedFile.getElement<Entity>(quads[0]?.subject.value, this.isIsolated);

    if (entity) {
      return entity;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    const defaultEntity = new DefaultEntity(null, null, null, new Array<OverWrittenProperty>());

    defaultEntity.setExternalReference(this.rdfModel.isExternalRef);
    defaultEntity.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultEntity, this.metaModelElementInstantiator.rdfModel);

    quads.forEach(quad => {
      if (bamm.isExtendsProperty(quad.predicate.value)) {
        const quads = this.rdfModel.store.getQuads(quad.object, null, null, null);
        const isEntity = quads.some(quad => bamm.isEntity(quad.object.value));
        defaultEntity.extendedElement = isEntity
          ? (this.createEntity(quads) as DefaultEntity)
          : new AbstractEntityInstantiator(this.metaModelElementInstantiator).createAbstractEntity(quads);
        return;
      }

      if (bamm.isPropertiesProperty(quad.predicate.value)) {
        defaultEntity.properties = this.metaModelElementInstantiator.getProperties(
          DataFactory.namedNode(quad.subject.value),
          bamm.PropertiesProperty()
        );
      }
    });

    return <Entity>this.cachedFile.resolveElement(defaultEntity, this.isIsolated);
  }
}
