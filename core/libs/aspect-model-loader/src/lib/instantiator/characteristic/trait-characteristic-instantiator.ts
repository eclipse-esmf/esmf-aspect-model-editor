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
import {Characteristic, DefaultTrait} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {allConstraintsFactory} from '../constraint';
import {characteristicFactory} from './characteristic-instantiator';

export function traitCharacteristicFactory(initProps: BaseInitProps) {
  const {
    rdfModel: {sammC},
  } = initProps;
  const {generateCharacteristic} = characteristicFactory(initProps);
  const {createConstraint} = allConstraintsFactory(initProps);

  return function createTraitCharacteristic(quad: Quad, characteristicCreator: (quad: Quad) => Characteristic): DefaultTrait {
    return generateCharacteristic(quad, (baseProperties, propertyQuads) => {
      const characteristic = new DefaultTrait({...baseProperties});

      for (const propertyQuad of propertyQuads) {
        if (sammC.isBaseCharacteristicProperty(propertyQuad.predicate.value)) {
          characteristic.baseCharacteristic = characteristicCreator(propertyQuad);
          characteristic.baseCharacteristic?.addParent(characteristic);
        } else if (sammC.isConstraintProperty(propertyQuad.predicate.value)) {
          const constraint = createConstraint(propertyQuad);
          if (constraint) {
            characteristic.constraints.push(constraint);
            constraint?.addParent(characteristic);
          }
        }
      }
      return characteristic;
    });
  };
}
