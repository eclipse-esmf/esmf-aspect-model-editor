/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {Quad} from 'n3';
import {Characteristic} from '../../aspect-meta-model/characteristic/default-characteristic';
import {DefaultList} from '../../aspect-meta-model/characteristic/default-list';
import {BaseInitProps} from '../../shared/base-init-props';
import {characteristicFactory} from './characteristic-instantiator';

export function listCharacteristicFactory(initProps: BaseInitProps) {
  const {
    rdfModel: {samm, sammC},
  } = initProps;
  const {generateCharacteristic, getDataType} = characteristicFactory(initProps);

  return function createListCharacteristic(quad: Quad, characteristicCreator?: (quad: Quad) => Characteristic): DefaultList {
    return generateCharacteristic(quad, (baseProperties, propertyQuads) => {
      const characteristic = new DefaultList({...baseProperties});

      for (const propertyQuad of propertyQuads) {
        if (samm.isDataTypeProperty(propertyQuad.predicate.value)) {
          characteristic.dataType = getDataType(propertyQuad);
        } else if (sammC.isElementCharacteristicProperty(propertyQuad.predicate.value)) {
          characteristic.elementCharacteristic = characteristicCreator?.(propertyQuad);
          if (characteristic.elementCharacteristic) {
            characteristic.elementCharacteristic.addParent(characteristic);
          }
        }
      }

      return characteristic;
    });
  };
}
