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
import {DefaultAbstractEntity} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class AbstractEntityInstantiator {
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

  createAbstractEntity(quads: Quad[]): DefaultAbstractEntity {
    const abstractEntity = this.cachedFile.getElement<DefaultAbstractEntity>(quads[0]?.subject.value, this.isIsolated);
    if (abstractEntity) {
      return abstractEntity;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    const defaultAbstractEntity = new DefaultAbstractEntity(null, null, null, []);
    defaultAbstractEntity.setExternalReference(this.rdfModel.isExternalRef);
    defaultAbstractEntity.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultAbstractEntity, this.metaModelElementInstantiator.rdfModel);

    quads.forEach(quad => {
      if (bamm.isExtendsProperty(quad.predicate.value)) {
        defaultAbstractEntity.extendedElement = this.createAbstractEntity(this.rdfModel.store.getQuads(quad.object, null, null, null));
        return;
      }

      if (bamm.isPropertiesProperty(quad.predicate.value)) {
        defaultAbstractEntity.properties = this.metaModelElementInstantiator.getProperties(
          DataFactory.namedNode(quad.subject.value),
          bamm.PropertiesProperty()
        );
      }
    });

    return this.cachedFile.resolveElement<DefaultAbstractEntity>(defaultAbstractEntity, this.isIsolated);
  }
}
