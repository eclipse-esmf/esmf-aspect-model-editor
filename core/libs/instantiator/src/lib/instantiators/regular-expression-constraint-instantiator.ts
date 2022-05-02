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

import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultRegularExpressionConstraint} from '@ame/meta-model';

export class RegularExpressionConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let regularExpressionConstraint = this.cachedFile.getElement<DefaultRegularExpressionConstraint>(
      quads[0]?.subject.value,
      this.isIsolated
    );
    if (regularExpressionConstraint) {
      return regularExpressionConstraint;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    regularExpressionConstraint = new DefaultRegularExpressionConstraint(null, null, null, null);

    quads.forEach(quad => {
      if (bamm.isValueProperty(quad.predicate.value)) {
        regularExpressionConstraint.value = quad.object.value;
      }
    });

    return regularExpressionConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.RegularExpressionConstraint().equals(nameNode);
  }
}
