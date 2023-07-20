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
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultEither} from '@ame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {syncElementWithChildren} from '../helpers';

export class EitherCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultEither = this.cachedFile.getElement<DefaultEither>(quads[0]?.subject.value);
    if (defaultEither) {
      return defaultEither;
    }

    defaultEither = new DefaultEither(null, null, null, null, null);
    for (const quad of quads) {
      if (this.sammC.isEitherLeftProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(quad, false, (extReference: Characteristic) => {
          defaultEither.left = extReference;
          if (extReference) defaultEither.children.push(extReference);
          syncElementWithChildren(defaultEither);
        });
        continue;
      }

      if (this.sammC.isEitherRightProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(quad, false, (extReference: Characteristic) => {
          defaultEither.right = extReference;
          if (extReference) defaultEither.children.push(extReference);
          syncElementWithChildren(defaultEither);
        });
      }
    }

    defaultEither.fileName = this.metaModelElementInstantiator.fileName;

    return defaultEither;
  }

  public shouldProcess(nameNode: NamedNode): boolean {
    return this.sammC.EitherCharacteristic().equals(nameNode);
  }
}
