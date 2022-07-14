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
import {Characteristic, DefaultCharacteristic, Type} from '@ame/meta-model';
import {BammCharacteristicInstantiator} from './bamm-characteristic-instantiator';
import {BaseConstraintCharacteristicInstantiator} from './base-constraint-characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class CharacteristicInstantiator extends BaseConstraintCharacteristicInstantiator {
  private standardCharacteristicInstantiator: BammCharacteristicInstantiator;

  protected get namespaceCacheService() {
    return this.metaModelElementInstantiator.namespaceCacheService;
  }

  protected get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get fileName() {
    return this.metaModelElementInstantiator.fileName;
  }

  constructor(protected metaModelElementInstantiator: MetaModelElementInstantiator, public nextProcessor?: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
    this.standardCharacteristicInstantiator = new BammCharacteristicInstantiator(metaModelElementInstantiator);
  }

  create(quad: Quad, isPredefinedCharacteristicFromExtRef?: boolean): Characteristic {
    let characteristic = this.cachedFile.getElement<Characteristic>(quad.object.value);
    if (characteristic) {
      return characteristic;
    }

    if (quad.object.value.startsWith(this.metaModelElementInstantiator.bammc.getNamespace())) {
      const standardCharacteristic = this.standardCharacteristicInstantiator.createCharacteristic(<NamedNode>quad.object);
      if (standardCharacteristic) {
        if (isPredefinedCharacteristicFromExtRef) {
          standardCharacteristic.setExternalReference(isPredefinedCharacteristicFromExtRef);
        }
        return standardCharacteristic;
      }
    }

    characteristic = super.create(quad);
    characteristic.setExternalReference(this.rdfModel.isExternalRef);
    characteristic.fileName = this.fileName;

    const typeQuad = this.metaModelElementInstantiator.rdfModel
      .findAnyProperty(quad)
      .find(propertyQuad => this.bamm.isDataTypeProperty(propertyQuad.predicate.value));

    this.metaModelElementInstantiator.getDataType(typeQuad, (entity: Type) => {
      characteristic.dataType = entity;
    });

    // Anonymous nodes are stored in the array for later processing of the name
    if ((characteristic as DefaultCharacteristic).isAnonymousNode()) {
      const initialName: string = characteristic.name;

      // TODO Rethink this
      // assign a unique random name
      const array = new Uint32Array(36);
      const randomNumber = crypto.getRandomValues(array).toString().substr(2, 9);

      characteristic.name = characteristic.name ? characteristic.name : 'characteristic_' + randomNumber;
      characteristic.aspectModelUrn = `${this.metaModelElementInstantiator.rdfModel.getAspectModelUrn()}${characteristic.name}`;
      this.cachedFile.addAnonymousElement(characteristic, initialName);
    }
    return this.cachedFile.resolveElement<Characteristic>(characteristic, this.isIsolated);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processElement(quads: Array<Quad>): Characteristic {
    return DefaultCharacteristic.createInstance();
  }

  isEntity(quad: Quad): boolean {
    if (this.bamm.Entity().equals(quad.object)) {
      return true;
    }

    const propertyFound = this.metaModelElementInstantiator.rdfModel
      .findAnyProperty(quad)
      .find(quadProperty => this.bamm.Entity().equals(quadProperty.subject));

    return !!propertyFound;
  }
}
