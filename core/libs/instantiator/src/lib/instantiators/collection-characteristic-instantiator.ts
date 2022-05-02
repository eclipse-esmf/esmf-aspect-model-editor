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
import {NamedNode, Quad} from 'n3';
import {Characteristic, Collection, DefaultCollection, Type} from '@ame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class CollectionCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    const collection = this.cachedFile.getElement<Characteristic>(quads[0]?.subject.value, this.isIsolated);
    if (collection) {
      return collection;
    }

    return this.initProperties(this.creatCollectionObject(), quads);
  }

  /**
   * Override the method in the corresponding specific collection class to create the correct type of
   * collection e.g. see ListCharacteristicInstantiator.
   */
  protected creatCollectionObject(): Collection {
    return new DefaultCollection(null, null, null, null);
  }

  private initProperties(collectionCharacteristic: Collection, quads: Array<Quad>): Collection {
    const bamm = this.metaModelElementInstantiator.bamm;
    const bammc = this.metaModelElementInstantiator.bammc;
    for (const quad of quads) {
      if (bamm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          collectionCharacteristic.dataType = entity;
        });
      } else if (bammc.isElementCharacteristicProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(quad, false, (characteristic: Characteristic) => {
          collectionCharacteristic.elementCharacteristic = characteristic;
        });
      }
    }
    return collectionCharacteristic;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.CollectionCharacteristic().equals(nameNode);
  }
}
