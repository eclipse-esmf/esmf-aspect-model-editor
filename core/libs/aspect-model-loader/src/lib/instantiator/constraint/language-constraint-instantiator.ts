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

import {Quad} from 'n3';
import {DefaultLanguageConstraint} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {constraintFactory} from './constraint-instantiator';

export function languageConstraintFactory(initProps: BaseInitProps) {
  const {
    rdfModel: {sammC},
  } = initProps;
  const {generateConstraint} = constraintFactory(initProps);

  return function createLanguageConstraint(quad: Quad): DefaultLanguageConstraint {
    return generateConstraint(quad, (baseProperties, propertyQuads) => {
      const constraint = new DefaultLanguageConstraint({...baseProperties, languageCode: null});
      for (const propertyQuad of propertyQuads) {
        if (sammC.isLanguageCodeProperty(propertyQuad.predicate.value)) {
          constraint.languageCode = propertyQuad.object.value;
        }
      }
      return constraint;
    });
  };
}
