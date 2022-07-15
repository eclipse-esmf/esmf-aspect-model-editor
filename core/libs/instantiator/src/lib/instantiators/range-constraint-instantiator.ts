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
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {ConstraintInstantiator} from './constraint-instantiator';
import {BoundDefinition, Constraint, DefaultRangeConstraint} from '@ame/meta-model';

export class RangeConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultRangeConstraint = this.cachedFile.getElement<DefaultRangeConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (defaultRangeConstraint) {
      return defaultRangeConstraint;
    }

    const bammc = this.metaModelElementInstantiator.bammc;
    defaultRangeConstraint = new DefaultRangeConstraint(null, null, null, null, null, null, null);

    quads.forEach(quad => {
      if (bammc.isMinValueProperty(quad.predicate.value)) {
        defaultRangeConstraint.minValue = quad.object.value;
      } else if (bammc.isMaxValueProperty(quad.predicate.value)) {
        defaultRangeConstraint.maxValue = quad.object.value;
      } else if (bammc.isUpperBoundDefinitionProperty(quad.predicate.value)) {
        defaultRangeConstraint.upperBoundDefinition = BoundDefinition[quad.object.value.replace(bammc.getNamespace(), '')];
      } else if (bammc.isLowerBoundDefinitionProperty(quad.predicate.value)) {
        defaultRangeConstraint.lowerBoundDefinition = BoundDefinition[quad.object.value.replace(bammc.getNamespace(), '')];
      }
    });
    return defaultRangeConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.RangeConstraint().equals(nameNode);
  }
}
