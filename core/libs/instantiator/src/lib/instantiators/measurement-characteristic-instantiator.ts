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
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultMeasurement, Unit} from '@ame/meta-model';

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
      if (this.metaModelElementInstantiator.sammC.isUnitProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getUnit(quad, (unit: Unit) => {
          measurement.unit = unit;
        });
      }
    });

    return measurement;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.MeasurementCharacteristic().equals(nameNode);
  }
}
