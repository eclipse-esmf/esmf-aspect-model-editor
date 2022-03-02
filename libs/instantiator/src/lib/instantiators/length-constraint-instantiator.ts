/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NamedNode, Quad} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultLengthConstraint} from '@bame/meta-model';

export class LengthConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultLengthConstraint = this.cachedFile.getElement<DefaultLengthConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (defaultLengthConstraint) {
      return defaultLengthConstraint;
    }

    const bammc = this.metaModelElementInstantiator.bammc;
    defaultLengthConstraint = new DefaultLengthConstraint(null, null, null, null, null);

    quads.forEach(quad => {
      if (bammc.isMinValueProperty(quad.predicate.value)) {
        defaultLengthConstraint.minValue = Number(quad.object.value);
      } else if (bammc.isMaxValueProperty(quad.predicate.value)) {
        defaultLengthConstraint.maxValue = Number(quad.object.value);
      }
    });

    return defaultLengthConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.LengthConstraint().equals(nameNode);
  }
}
