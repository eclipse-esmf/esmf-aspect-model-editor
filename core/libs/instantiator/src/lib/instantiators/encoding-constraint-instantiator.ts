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
import {Constraint, DefaultEncodingConstraint} from '@ame/meta-model';
import {ConstraintInstantiator} from './constraint-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class EncodingConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let encodingConstraint = this.cachedFile.getElement<DefaultEncodingConstraint>(quads[0]?.subject.value);
    if (encodingConstraint) {
      return encodingConstraint;
    }

    const samm = this.metaModelElementInstantiator.samm;
    encodingConstraint = new DefaultEncodingConstraint(null, null, null, null);

    quads.forEach(quad => {
      if (samm.isValueProperty(quad.predicate.value)) {
        encodingConstraint.value = quad.object.value;
      }
    });

    return encodingConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.EncodingConstraint().equals(nameNode);
  }
}
