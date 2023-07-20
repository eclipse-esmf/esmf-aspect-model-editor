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
import {Characteristic, Constraint, DefaultTrait} from '@ame/meta-model';
import {syncElementWithChildren} from '../helpers';

export class TraitCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultTrait = this.cachedFile.getElement<DefaultTrait>(quads[0]?.subject.value);
    if (defaultTrait) {
      return defaultTrait;
    }

    const sammC = this.metaModelElementInstantiator.sammC;
    defaultTrait = new DefaultTrait(null, null, null, null, new Array<Constraint>());
    defaultTrait.fileName = this.metaModelElementInstantiator.fileName;

    quads.forEach(quad => {
      if (sammC.isBaseCharacteristicProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(quad, false, (extReference: Characteristic) => {
          defaultTrait.baseCharacteristic = extReference;
          if (extReference) defaultTrait.children.push(extReference);
          syncElementWithChildren(defaultTrait);
        });
      } else if (sammC.isConstraintProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadConstraint(quad, (constraint: Constraint) => {
          defaultTrait.constraints.push(constraint);
          if (constraint) defaultTrait.children.push(constraint);
          syncElementWithChildren(defaultTrait);
        });
      }
    });

    return defaultTrait;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.TraitCharacteristic().equals(nameNode);
  }
}
