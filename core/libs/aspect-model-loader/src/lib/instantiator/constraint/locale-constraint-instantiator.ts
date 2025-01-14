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
import {DefaultLocaleConstraint} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {constraintFactory} from './constraint-instantiator';

export function localeConstraintFactory(initProps: BaseInitProps) {
  const {
    rdfModel: {sammC},
  } = initProps;
  const {generateConstraint} = constraintFactory(initProps);

  return function createLocaleConstraint(quad: Quad): DefaultLocaleConstraint {
    return generateConstraint(quad, (baseProperties, propertyQuads) => {
      const constraint = new DefaultLocaleConstraint({...baseProperties, localeCode: null});
      for (const propertyQuad of propertyQuads) {
        if (sammC.isLocaleCodeProperty(propertyQuad.predicate.value)) {
          constraint.localeCode = propertyQuad.object.value;
        }
      }
      return constraint;
    });
  };
}
