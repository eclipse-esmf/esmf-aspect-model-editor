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

import {Quad, Util} from 'n3';
import {DefaultProperty} from '../../aspect-meta-model';
import {DefaultStructuredValue} from '../../aspect-meta-model/characteristic/default-structured-value';
import {BaseInitProps} from '../../shared/base-init-props';
import {propertyFactory} from '../property-instantiator';
import {characteristicFactory} from './characteristic-instantiator';

export function structuredValueCharacteristicFactory(initProps: BaseInitProps) {
  const {rdfModel} = initProps;
  const {samm, sammC} = rdfModel;
  const {generateCharacteristic, getDataType} = characteristicFactory(initProps);
  const {createProperty} = propertyFactory(initProps);

  return function createStructuredValueCharacteristic(quad: Quad): DefaultStructuredValue {
    return generateCharacteristic(quad, (baseProperties, propertyQuads) => {
      const characteristic = new DefaultStructuredValue({
        ...baseProperties,
        dataType: getDataType(propertyQuads.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value))),
        deconstructionRule: null,
        elements: [],
      });

      for (const propertyQuad of propertyQuads) {
        if (sammC.isDeconstructionRuleProperty(propertyQuad.predicate.value)) {
          characteristic.deconstructionRule = propertyQuad.object.value;
        } else if (sammC.isElementsProperty(propertyQuad.predicate.value)) {
          characteristic.elements = rdfModel
            .resolveBlankNodes(propertyQuad.object.value)
            .map((elementQuad: Quad) => (Util.isNamedNode(elementQuad.object) ? createProperty(elementQuad) : elementQuad.object.value));

          characteristic.elements.forEach(element => element instanceof DefaultProperty && element.addParent(characteristic));
        }
      }
      return characteristic;
    });
  };
}
