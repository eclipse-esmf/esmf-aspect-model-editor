/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NamedNode, Quad} from 'n3';
import {Constraint, DefaultFixedPointConstraint} from '@bame/meta-model';
import {ConstraintInstantiator} from './constraint-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class FixedPointConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultFixedPointConstraint = this.cachedFile.getElement<DefaultFixedPointConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (defaultFixedPointConstraint) {
      return defaultFixedPointConstraint;
    }

    const bammc = this.metaModelElementInstantiator.bammc;
    defaultFixedPointConstraint = new DefaultFixedPointConstraint(null, null, null, null, null);

    quads.forEach(quad => {
      if (bammc.isScaleValueProperty(quad.predicate.value)) {
        defaultFixedPointConstraint.scale = Number(quad.object.value);
      } else if (bammc.isIntegerValueProperty(quad.predicate.value)) {
        defaultFixedPointConstraint.integer = Number(quad.object.value);
      }
    });

    return defaultFixedPointConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.FixedPointConstraint().equals(nameNode);
  }
}
