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
import {Constraint, DefaultFixedPointConstraint} from '@ame/meta-model';
import {ConstraintInstantiator} from './constraint-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class FixedPointConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultFixedPointConstraint = this.cachedFile.getElement<DefaultFixedPointConstraint>(quads[0]?.subject.value);
    if (defaultFixedPointConstraint) {
      return defaultFixedPointConstraint;
    }

    const sammC = this.metaModelElementInstantiator.sammC;
    defaultFixedPointConstraint = new DefaultFixedPointConstraint(null, null, null, null, null);

    quads.forEach(quad => {
      if (sammC.isScaleValueProperty(quad.predicate.value)) {
        defaultFixedPointConstraint.scale = Number(quad.object.value);
      } else if (sammC.isIntegerValueProperty(quad.predicate.value)) {
        defaultFixedPointConstraint.integer = Number(quad.object.value);
      }
    });

    return defaultFixedPointConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.FixedPointConstraint().equals(nameNode);
  }
}
