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
import {Characteristic, DefaultCode, Type} from '@ame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class CodeCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    const code = this.cachedFile.getElement<Characteristic>(quads[0]?.subject.value, this.isIsolated);
    if (code) {
      return code;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    const defaultCode = new DefaultCode(null, null, null, null);

    quads.forEach(quad => {
      if (bamm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          defaultCode.dataType = entity;
        });
      }
    });

    return defaultCode;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.CodeCharacteristic().equals(nameNode);
  }
}
