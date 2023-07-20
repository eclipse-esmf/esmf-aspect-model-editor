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
import {NamedNode, Quad} from 'n3';
import {Characteristic, Collection, DefaultCollection, DefaultEntity, Type} from '@ame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {syncElementWithChildren} from '../helpers';

export class CollectionCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    const collection = this.cachedFile.getElement<Characteristic>(quads[0]?.subject.value);
    if (collection) {
      return collection;
    }

    return this.initProperties(this.createCollectionObject(), quads);
  }

  /**
   * Override the method in the corresponding specific collection class to create the correct type of
   * collection e.g. see ListCharacteristicInstantiator.
   */
  protected createCollectionObject(): Collection {
    return new DefaultCollection(null, null, null, null);
  }

  private initProperties(collectionCharacteristic: Collection, quads: Array<Quad>): Collection {
    const samm = this.metaModelElementInstantiator.samm;
    const sammC = this.metaModelElementInstantiator.sammC;
    for (const quad of quads) {
      if (samm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          collectionCharacteristic.dataType = entity;
          if (entity instanceof DefaultEntity) collectionCharacteristic.children.push(entity);
        });
      } else if (sammC.isElementCharacteristicProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(quad, false, (characteristic: Characteristic) => {
          collectionCharacteristic.elementCharacteristic = characteristic;
          if (characteristic) collectionCharacteristic.children.push(characteristic);
          syncElementWithChildren(collectionCharacteristic);
        });
      }
    }

    collectionCharacteristic.fileName = this.metaModelElementInstantiator.fileName;

    return collectionCharacteristic;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.CollectionCharacteristic().equals(nameNode);
  }
}
