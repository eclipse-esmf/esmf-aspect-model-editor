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
import {DefaultCode} from '../../aspect-meta-model/characteristic/default-code';
import {BaseInitProps} from '../../shared/base-init-props';
import {characteristicFactory} from './characteristic-instantiator';

export function codeCharacteristicFactory(initProps: BaseInitProps) {
  const {rdfModel} = initProps;
  const {generateCharacteristic, getDataType} = characteristicFactory(initProps);

  return function createCodeCharacteristic(quad: Quad): DefaultCode {
    const {samm} = rdfModel;
    return generateCharacteristic<DefaultCode>(quad, (baseProperties, propertyQuads) => {
      return new DefaultCode({
        ...baseProperties,
        dataType: getDataType(propertyQuads.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value))),
      });
    });
  };
}
