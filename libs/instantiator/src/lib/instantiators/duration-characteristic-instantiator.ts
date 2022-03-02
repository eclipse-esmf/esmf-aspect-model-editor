/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultDuration, Unit} from '@bame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class DurationCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let durationCharacteristic = this.cachedFile.getElement<DefaultDuration>(quads[0]?.subject.value, this.isIsolated);
    if (durationCharacteristic) {
      return durationCharacteristic;
    }
    durationCharacteristic = new DefaultDuration(null, null, null, null, null);

    quads.forEach(quad => {
      if (this.metaModelElementInstantiator.bammc.isUnitProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getUnit(quad, (unit: Unit) => {
          durationCharacteristic.unit = unit;
        });
      }
    });

    return durationCharacteristic;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.DurationCharacteristic().equals(nameNode);
  }
}
