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
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultSingleEntity, Type} from '@ame/meta-model';

export class SingleEntityInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultSingleEntity = this.cachedFile.getElement<DefaultSingleEntity>(quads[0]?.subject.value, this.isIsolated);
    if (defaultSingleEntity) {
      return defaultSingleEntity;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    defaultSingleEntity = new DefaultSingleEntity(null, null, null, null);
    defaultSingleEntity.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultSingleEntity, this.metaModelElementInstantiator.rdfModel);

    quads.forEach(quad => {
      if (bamm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          defaultSingleEntity.dataType = entity;
        });
      }
    });

    return defaultSingleEntity;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.SingleEntityCharacteristic().equals(nameNode);
  }
}
