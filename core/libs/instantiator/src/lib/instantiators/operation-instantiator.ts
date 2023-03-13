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

import {DefaultOperation, DefaultProperty, Operation, OverWrittenProperty} from '@ame/meta-model';
import {DataFactory} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {InstantiatorListElement, RdfModel} from '@ame/rdf/utils';

export class OperationInstantiator {
  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get currentCachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  public createOperation(listElement: InstantiatorListElement): Operation {
    const operation = this.currentCachedFile.getElement<DefaultOperation>(listElement.quad.value, this.isIsolated);
    return operation ? operation : this.constructOperation(listElement);
  }

  constructOperation(listElement: InstantiatorListElement): Operation {
    const samm = this.metaModelElementInstantiator.samm;
    const operation = new DefaultOperation(null, null, null, new Array<OverWrittenProperty>(), null);
    const quads = this.resolveQuads(listElement, this.rdfModel);

    operation.setExternalReference(this.rdfModel.isExternalRef);
    operation.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, operation, this.rdfModel);
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(operation, this.isIsolated);

    quads.forEach(quad => {
      if (samm.isInputProperty(quad.predicate.value)) {
        operation.input = this.metaModelElementInstantiator.getProperties(DataFactory.namedNode(quad.subject.value), samm.InputProperty());
      } else if (samm.isOutputProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadOutputProperty(quad, false, (property: DefaultProperty) => {
          operation.output = {keys: {}, property: property};
        });
      }
    });

    return operation;
  }

  private resolveQuads(element: InstantiatorListElement, rdfModel: RdfModel) {
    return element.quad ? rdfModel.findAnyProperty(DataFactory.namedNode(element.quad.value)) : [];
  }
}
