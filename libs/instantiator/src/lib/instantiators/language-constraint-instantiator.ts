/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NamedNode, Quad} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {ConstraintInstantiator} from './constraint-instantiator';
import {Constraint, DefaultLanguageConstraint} from '@bame/meta-model';

export class LanguageConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultLanguageConstraint = this.cachedFile.getElement<DefaultLanguageConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (defaultLanguageConstraint) {
      return defaultLanguageConstraint;
    }

    const bammc = this.metaModelElementInstantiator.bammc;
    defaultLanguageConstraint = new DefaultLanguageConstraint(null, null, null, null);

    quads.forEach(quad => {
      if (bammc.isLanguageCodeProperty(quad.predicate.value)) {
        defaultLanguageConstraint.languageCode = quad.object.value;
      }
    });

    return defaultLanguageConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.LanguageConstraint().equals(nameNode);
  }
}
