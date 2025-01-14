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

import {Quad} from 'n3';
import {DefaultDuration} from '../../aspect-meta-model/characteristic/default-duration';
import {BaseInitProps} from '../../shared/base-init-props';
import {unitFactory} from '../predefined-unit-instantiator';
import {characteristicFactory} from './characteristic-instantiator';

export function durationCharacteristicFactory(initProps: BaseInitProps) {
  const {
    rdfModel: {samm, sammC},
  } = initProps;
  const {generateCharacteristic, getDataType} = characteristicFactory(initProps);
  const {createUnit} = unitFactory(initProps);

  return function createDurationCharacteristic(quad: Quad): DefaultDuration {
    return generateCharacteristic(quad, (baseProperties, propertyQuads) => {
      const characteristic = new DefaultDuration({...baseProperties});

      for (const propertyQuad of propertyQuads) {
        if (sammC.isUnitProperty(propertyQuad.predicate.value)) {
          characteristic.unit = createUnit(quad.object.value);
          if (characteristic.unit) {
            characteristic.unit.addParent(characteristic);
          }
        } else if (samm.isDataTypeProperty(propertyQuad.predicate.value)) {
          characteristic.dataType = getDataType(propertyQuad);
        }
      }
      return characteristic;
    });
  };
}
