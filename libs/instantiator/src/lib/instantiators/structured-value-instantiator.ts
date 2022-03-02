/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad, Util} from 'n3';
import {Characteristic, DefaultStructuredValue, OverWrittenProperty} from '@bame/meta-model';

export class StructuredValueCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let structuredValueCharacteristic = this.cachedFile.getElement<DefaultStructuredValue>(quads[0]?.subject.value, this.isIsolated);
    if (structuredValueCharacteristic) {
      return structuredValueCharacteristic;
    }

    const bammc = this.metaModelElementInstantiator.bammc;
    structuredValueCharacteristic = new DefaultStructuredValue(null, null, null, null, null, null);
    quads.forEach(quad => {
      if (bammc.isDeconstructionRuleProperty(quad.predicate.value)) {
        structuredValueCharacteristic.deconstructionRule = quad.object.value;
        return;
      }

      if (bammc.isElementsProperty(quad.predicate.value)) {
        structuredValueCharacteristic.elements = [];
        const structuredValueElementsQuad = this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(quad.object.value);

        structuredValueElementsQuad.forEach((elementQuad, index) => {
          if (Util.isNamedNode(elementQuad.object)) {
            this.metaModelElementInstantiator.getProperty({quad: elementQuad.object}, (extProperty: OverWrittenProperty) => {
              structuredValueCharacteristic.elements[index] = extProperty;
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
    return this.metaModelElementInstantiator.bammc.StructuredValueCharacteristic().equals(nameNode);
  }
}
