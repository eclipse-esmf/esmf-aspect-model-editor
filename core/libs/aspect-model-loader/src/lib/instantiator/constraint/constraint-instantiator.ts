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

import {Quad, Util} from 'n3';
import {Constraint, DefaultConstraint} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {NamedElementProps} from '../../shared/props';
import {basePropertiesFactory} from '../meta-model-element-instantiator';

export function constraintFactory(initProps: BaseInitProps) {
  const {rdfModel, cache} = initProps;

  function createDefaultConstraint(quad: Quad): DefaultConstraint {
    return generateConstraint(quad, baseProperties => {
      return new DefaultConstraint({...baseProperties});
    });
  }

  function generateConstraint<C extends Constraint>(
    quad: Quad,
    constraintFactory: (baseProperties: NamedElementProps, propertyQuads: Quad[]) => C,
  ): C {
    if (cache.get(quad.subject.value)) return cache.get(quad.subject.value);

    const isAnonymous = Util.isBlankNode(quad.object);
    const propertyQuads: Quad[] = rdfModel.findAnyProperty(quad);
    const elementQuad = isAnonymous ? rdfModel.resolveBlankNodes(quad.object.value).shift() : propertyQuads.shift();
    const baseProperties = basePropertiesFactory(initProps)(elementQuad.subject);

    const constraint: C = constraintFactory(baseProperties, propertyQuads);

    constraint.anonymous = isAnonymous;
    if (constraint.isAnonymous()) {
      generateConstraintName(constraint);
    }

    return cache.resolveInstance(constraint);
  }

  function generateConstraintName(constraint: Constraint) {
    const initialUrn: string = constraint.aspectModelUrn;

    // assign a unique random name
    constraint.name = constraint.name ? constraint.name : 'Constraint' + Math.random().toString(36).substring(2, 9);
    constraint.aspectModelUrn = `${rdfModel.getAspectModelUrn()}${constraint.name}`;
    constraint.syntheticName = true;
    cache.addElement(initialUrn, constraint);
  }

  return {
    createDefaultConstraint,
    generateConstraint,
    generateConstraintName,
  };
}
