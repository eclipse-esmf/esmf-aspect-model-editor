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
import {Characteristic} from '../../aspect-meta-model';
import {DefaultEither, Either} from '../../aspect-meta-model/characteristic/default-either';
import {BaseInitProps} from '../../shared/base-init-props';
import {characteristicFactory} from './characteristic-instantiator';

export function eitherCharacteristicFactory(initProps: BaseInitProps) {
  const {
    rdfModel: {sammC},
  } = initProps;
  const {generateCharacteristic} = characteristicFactory(initProps);

  return function createEitherCharacteristic(quad: Quad, characteristicCreator: (quad: Quad) => Characteristic): Either {
    return generateCharacteristic(quad, (baseProperties, propertyQuads) => {
      const characteristic = new DefaultEither({
        ...baseProperties,
        left: null,
        right: null,
      });

      for (const propertyQuad of propertyQuads) {
        if (sammC.isEitherLeftProperty(propertyQuad.predicate.value)) {
          characteristic.left = characteristicCreator(propertyQuad);
          characteristic.left && characteristic.left.addParent(characteristic);
        } else if (sammC.isEitherRightProperty(propertyQuad.predicate.value)) {
          characteristic.right && characteristic.right.addParent(characteristic);
          characteristic.right = characteristicCreator(propertyQuad);
        }
      }
      return characteristic;
    });
  };
}
