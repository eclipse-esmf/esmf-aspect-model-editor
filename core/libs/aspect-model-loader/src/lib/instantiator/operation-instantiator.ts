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

import {Quad, Quad_Subject} from 'n3';
import {DefaultOperation, Operation} from '../aspect-meta-model/default-operation';
import {BaseInitProps} from '../shared/base-init-props';
import {basePropertiesFactory} from './meta-model-element-instantiator';
import {propertyFactory} from './property-instantiator';

export function operationFactory(initProps: BaseInitProps) {
  return (quad: Quad): DefaultOperation => {
    const rdfModel = initProps.rdfModel;
    const {samm} = rdfModel;
    const modelElementCache = initProps.cache;

    if (modelElementCache.get(quad.subject.value)) {
      return modelElementCache.get(quad.subject.value);
    }

    const quads = rdfModel.findAnyProperty(quad);
    const baseProperties = basePropertiesFactory(initProps)(quad.subject);
    const operation = new DefaultOperation({
      ...baseProperties,
      input: [],
      output: null,
    });

    for (const quad of quads) {
      if (samm.isInputProperty(quad.predicate.value)) {
        const inputQuads = rdfModel.resolveBlankNodes(quad.object.value);
        operation.input = inputQuads.map(input => {
          const property = propertyFactory(initProps).createProperty(input).property;
          property.addParent(operation);
          return property;
        });
        continue;
      }

      if (samm.isOutputProperty(quad.predicate.value)) {
        operation.output = propertyFactory(initProps).createProperty(quad).property;
        operation.output?.addParent(operation);
      }
    }

    return modelElementCache.resolveInstance(operation);
  };
}

export function getOperations(initProps: BaseInitProps) {
  return (subject: Quad_Subject): Array<Operation> => {
    const operations: Array<Operation> = [];

    const rdfModel = initProps.rdfModel;
    const {samm, store} = rdfModel;

    store.getQuads(subject, samm.OperationsProperty(), null, null).forEach(operationQuad => {
      rdfModel
        .resolveBlankNodes(operationQuad.object.value)
        .forEach(resolvedOperationQuad => operations.push(operationFactory(initProps)(resolvedOperationQuad)));
    });

    return operations;
  };
}
