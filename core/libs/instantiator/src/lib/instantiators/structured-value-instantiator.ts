/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {NamedNode, Quad, Util} from 'n3';
import {Characteristic, DefaultStructuredValue, OverWrittenProperty} from '@ame/meta-model';
import {syncElementWithChildren} from '../helpers';

export class StructuredValueCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let structuredValueCharacteristic = this.cachedFile.getElement<DefaultStructuredValue>(quads[0]?.subject.value);
    if (structuredValueCharacteristic) {
      return structuredValueCharacteristic;
    }

    const sammC = this.metaModelElementInstantiator.sammC;
    structuredValueCharacteristic = new DefaultStructuredValue(null, null, null, null, null, null);
    structuredValueCharacteristic.fileName = this.metaModelElementInstantiator.fileName;
    quads.forEach(quad => {
      if (sammC.isDeconstructionRuleProperty(quad.predicate.value)) {
        structuredValueCharacteristic.deconstructionRule = quad.object.value;
        return;
      }

      if (sammC.isElementsProperty(quad.predicate.value)) {
        structuredValueCharacteristic.elements = [];
        const structuredValueElementsQuad = this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(quad.object.value);

        structuredValueElementsQuad.forEach((elementQuad, index) => {
          if (Util.isNamedNode(elementQuad.object)) {
            this.metaModelElementInstantiator.getProperty({quad: elementQuad.object}, (extProperty: OverWrittenProperty) => {
              structuredValueCharacteristic.elements[index] = extProperty;
              if (extProperty) structuredValueCharacteristic.children.push(extProperty.property);
              syncElementWithChildren(structuredValueCharacteristic);
            });
          } else {
            structuredValueCharacteristic.elements[index] = elementQuad.object.value;
          }
        });
      }
    });

    return structuredValueCharacteristic;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.StructuredValueCharacteristic().equals(nameNode);
  }
}
