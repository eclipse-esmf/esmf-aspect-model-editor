/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NamedNode, Quad} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultLocaleConstraint} from '@bame/meta-model';

export class LocaleConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultLocaleConstraint = this.cachedFile.getElement<DefaultLocaleConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (defaultLocaleConstraint) {
      return defaultLocaleConstraint;
    }

    const bammc = this.metaModelElementInstantiator.bammc;
    defaultLocaleConstraint = new DefaultLocaleConstraint(null, null, null, null);

    quads.forEach(quad => {
      if (bammc.isLocaleCodeProperty(quad.predicate.value)) {
        defaultLocaleConstraint.localeCode = quad.object.value;
      }
    });

    return defaultLocaleConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.LocaleConstraint().equals(nameNode);
  }
}
