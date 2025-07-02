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

import {NamedNode, Quad, Util} from 'n3';
import {Constraint} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {constraintFactory} from './constraint-instantiator';
import {encodingConstraintFactory} from './encoding-constraint-instantiator';
import {fixedPointConstraintFactory} from './fixed-point-constraint-instantiator';
import {languageConstraintFactory} from './language-constraint-instantiator';
import {lengthConstraintFactory} from './length-constraint-instantiator';
import {localeConstraintFactory} from './locale-constraint-instantiator';
import {rangeConstraintFactory} from './range-constraint-instantiator';
import {regularExpressionConstraintFactory} from './regular-expression-constraint-instantiator';

export function allConstraintsFactory(initProps: BaseInitProps) {
  const {rdfModel} = initProps;

  const {createDefaultConstraint} = constraintFactory(initProps);
  const createEncodingConstraint = encodingConstraintFactory(initProps);
  const createFixedPointConstraint = fixedPointConstraintFactory(initProps);
  const createLanguageConstraint = languageConstraintFactory(initProps);
  const createLengthConstraint = lengthConstraintFactory(initProps);
  const createLocaleConstraint = localeConstraintFactory(initProps);
  const createRangeConstraint = rangeConstraintFactory(initProps);
  const createRegularExpressionConstraint = regularExpressionConstraintFactory(initProps);

  const processors = [
    // Constraint
    {
      process: (quad: Quad) => createDefaultConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.samm.Constraint().equals(namedNode),
    },
    // EncodingConstraint
    {
      process: (quad: Quad) => createEncodingConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.EncodingConstraint().equals(namedNode),
    },
    // FixedPointConstraint
    {
      process: (quad: Quad) => createFixedPointConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.FixedPointConstraint().equals(namedNode),
    },
    // LanguageConstraint
    {
      process: (quad: Quad) => createLanguageConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.LanguageConstraint().equals(namedNode),
    },
    // LengthConstraint
    {
      process: (quad: Quad) => createLengthConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.LengthConstraint().equals(namedNode),
    },
    // LocaleConstraint
    {
      process: (quad: Quad) => createLocaleConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.LocaleConstraint().equals(namedNode),
    },
    // RangeConstraint
    {
      process: (quad: Quad) => createRangeConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.RangeConstraint().equals(namedNode),
    },
    // RegularExpressionConstraint
    {
      process: (quad: Quad) => createRegularExpressionConstraint(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.RegularExpressionConstraint().equals(namedNode),
    },
  ];

  function detectAndCreateConstraint(quad: Quad): Constraint {
    if (!quad || !quad?.object) return null;

    const constraintQuads = Util.isBlankNode(quad.object)
      ? rdfModel.resolveBlankNodes(quad.object.value)
      : rdfModel.store.getQuads(quad.object, null, null, null);
    const elementDefinitionQuad = constraintQuads.find(q => rdfModel.samm.RdfType().equals(q.predicate));
    if (!elementDefinitionQuad) {
      return null;
    }

    for (const processor of processors) {
      if (processor.shouldProcess(elementDefinitionQuad.object as NamedNode)) {
        return processor.process(quad);
      }
    }

    return null;
  }

  return {
    createEncodingConstraint,
    createFixedPointConstraint,
    createLanguageConstraint,
    createLengthConstraint,
    createLocaleConstraint,
    createRangeConstraint,
    createRegularExpressionConstraint,
    createConstraint: detectAndCreateConstraint,
  };
}
