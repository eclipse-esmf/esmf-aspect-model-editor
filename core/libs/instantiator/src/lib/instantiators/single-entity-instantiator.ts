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
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultEntity, DefaultSingleEntity, Type} from '@ame/meta-model';
import {syncElementWithChildren} from '../helpers';

export class SingleEntityInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultSingleEntity = this.cachedFile.getElement<DefaultSingleEntity>(quads[0]?.subject.value);
    if (defaultSingleEntity) {
      return defaultSingleEntity;
    }

    const samm = this.metaModelElementInstantiator.samm;
    defaultSingleEntity = new DefaultSingleEntity(null, null, null, null);
    defaultSingleEntity.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultSingleEntity, this.metaModelElementInstantiator.rdfModel);

    quads.forEach(quad => {
      if (samm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          defaultSingleEntity.dataType = entity;
          if (entity instanceof DefaultEntity) defaultSingleEntity.children.push(entity);
          syncElementWithChildren(defaultSingleEntity);
        });
      }
    });

    return defaultSingleEntity;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.SingleEntityCharacteristic().equals(nameNode);
  }
}
