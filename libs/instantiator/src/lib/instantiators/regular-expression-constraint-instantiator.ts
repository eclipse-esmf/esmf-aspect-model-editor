/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultRegularExpressionConstraint} from '@bame/meta-model';

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
