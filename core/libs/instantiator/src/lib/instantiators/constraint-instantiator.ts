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

import {Quad} from 'n3';
import {Characteristic, Constraint, DefaultConstraint} from '@ame/meta-model';
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
    constraint.fileName = this.metaModelElementInstantiator.fileName;

    // Anonymous nodes are stored in the array for later processing of the name
    if ((constraint as DefaultConstraint).isAnonymousNode()) {
      constraint.name = constraint.name || `Constraint${quad.subject.value.split('#')[1]}`;
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
