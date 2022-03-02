/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultQuantifiable, Unit} from '@bame/meta-model';

export class QuantifiableCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let quantifiable = this.cachedFile.getElement<DefaultQuantifiable>(quads[0]?.subject.value, this.isIsolated);
    if (quantifiable) {
      return quantifiable;
    }

    quantifiable = new DefaultQuantifiable(null, null, null, null, null);

    quads.forEach(quad => {
      if (this.metaModelElementInstantiator.bammc.isUnitProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getUnit(quad, (unit: Unit) => {
          quantifiable.unit = unit;
        });
      }
    });

    return quantifiable;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.QuantifiableCharacteristic().equals(nameNode);
  }
}
