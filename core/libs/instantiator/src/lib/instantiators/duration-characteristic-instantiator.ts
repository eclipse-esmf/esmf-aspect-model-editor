/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultDuration, Unit} from '@ame/meta-model';
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
