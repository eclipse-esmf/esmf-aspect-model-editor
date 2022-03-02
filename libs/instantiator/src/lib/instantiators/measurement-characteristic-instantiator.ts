/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultMeasurement, Unit} from '@bame/meta-model';

export class MeasurementCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let measurement = this.cachedFile.getElement<DefaultMeasurement>(quads[0]?.subject.value, this.isIsolated);
    if (measurement) {
      return measurement;
    }

    measurement = new DefaultMeasurement(null, null, null, null, null);

    quads.forEach(quad => {
      if (this.metaModelElementInstantiator.bammc.isUnitProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getUnit(quad, (unit: Unit) => {
          measurement.unit = unit;
        });
      }
    });

    return measurement;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.MeasurementCharacteristic().equals(nameNode);
  }
}
