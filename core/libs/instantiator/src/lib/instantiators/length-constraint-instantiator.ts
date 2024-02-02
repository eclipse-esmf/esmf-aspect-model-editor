/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultLengthConstraint} from '@ame/meta-model';

export class LengthConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultLengthConstraint = this.cachedFile.getElement<DefaultLengthConstraint>(quads[0]?.subject.value);
    if (defaultLengthConstraint) {
      return defaultLengthConstraint;
    }

    const sammC = this.metaModelElementInstantiator.sammC;
    defaultLengthConstraint = new DefaultLengthConstraint(null, null, null, null, null);

    quads.forEach(quad => {
      if (sammC.isMinValueProperty(quad.predicate.value)) {
        defaultLengthConstraint.minValue = Number(quad.object.value);
      } else if (sammC.isMaxValueProperty(quad.predicate.value)) {
        defaultLengthConstraint.maxValue = Number(quad.object.value);
      }
    });

    return defaultLengthConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.LengthConstraint().equals(nameNode);
  }
}
