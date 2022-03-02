/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {NamedNode, Quad} from 'n3';
import {Constraint, DefaultEncodingConstraint} from '@bame/meta-model';
import {ConstraintInstantiator} from './constraint-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class EncodingConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let encodingConstraint = this.cachedFile.getElement<DefaultEncodingConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (encodingConstraint) {
      return encodingConstraint;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    encodingConstraint = new DefaultEncodingConstraint(null, null, null, null);

    quads.forEach(quad => {
      if (bamm.isValueProperty(quad.predicate.value)) {
        encodingConstraint.value = quad.object.value;
      }
    });

    return encodingConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.EncodingConstraint().equals(nameNode);
  }
}
