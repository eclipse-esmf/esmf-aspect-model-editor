/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {Constraint, DefaultLanguageConstraint} from '@ame/meta-model';

export class LanguageConstraintInstantiator extends ConstraintInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: ConstraintInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Constraint {
    let defaultLanguageConstraint = this.cachedFile.getElement<DefaultLanguageConstraint>(quads[0]?.subject.value, this.isIsolated);
    if (defaultLanguageConstraint) {
      return defaultLanguageConstraint;
    }

    const sammC = this.metaModelElementInstantiator.sammC;
    defaultLanguageConstraint = new DefaultLanguageConstraint(null, null, null, null);

    quads.forEach(quad => {
      if (sammC.isLanguageCodeProperty(quad.predicate.value)) {
        defaultLanguageConstraint.languageCode = quad.object.value;
      }
    });

    return defaultLanguageConstraint;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.LanguageConstraint().equals(nameNode);
  }
}
