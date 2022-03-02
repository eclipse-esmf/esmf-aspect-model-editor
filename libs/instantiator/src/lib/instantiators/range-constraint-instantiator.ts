/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NamedNode, Quad} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultRangeConstraint, BoundDefinition} from '@bame/meta-model';

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
