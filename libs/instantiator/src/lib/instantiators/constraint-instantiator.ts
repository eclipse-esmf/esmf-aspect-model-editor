/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Quad} from 'n3';
import {Characteristic, Constraint, DefaultConstraint} from '@bame/meta-model';
import {BaseConstraintCharacteristicInstantiator} from './base-constraint-characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class ConstraintInstantiator extends BaseConstraintCharacteristicInstantiator {
  private get namespaceCacheService() {
    return this.metaModelElementInstantiator.namespaceCacheService;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  constructor(protected metaModelElementInstantiator: MetaModelElementInstantiator, public nextProcessor?: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  create(quad: Quad): Constraint {
    const extReference = this.namespaceCacheService.findElementOnExtReference<Characteristic>(quad.object.value);
    if (extReference) {
      extReference.setExternalReference(true);
      return extReference;
    }

    if (!this.rdfModel.store.getQuads(quad.object, null, null, null).length) {
      const {externalReference} = this.metaModelElementInstantiator.getExternalElement<Characteristic>(quad.object);
      return externalReference;
    }

    const constraint = super.create(quad);
    constraint.setExternalReference(this.rdfModel.isExternalRef);

    // Anonymous nodes are stored in the array for later processing of the name
    if ((constraint as DefaultConstraint).isAnonymousNode()) {
      const parentNameQuad = this.rdfModel.store
        .getQuads(quad.subject, null, null, null)
        .find(({predicate}) => predicate.equals(this.rdfModel.BAMM().NameProperty()));

      constraint.name = constraint.name || `Constraint${parentNameQuad?.object?.value}`;
      constraint.aspectModelUrn = `${this.metaModelElementInstantiator.rdfModel.getAspectModelUrn()}${constraint.name}`;
      this.cachedFile.addAnonymousElement(constraint, constraint.name);
    }

    return <DefaultConstraint>this.cachedFile.resolveElement(constraint, this.isIsolated);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processElement(quads: Array<Quad>): Constraint {
    return DefaultConstraint.createInstance();
  }
}
