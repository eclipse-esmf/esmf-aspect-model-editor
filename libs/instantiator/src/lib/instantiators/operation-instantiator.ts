/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultOperation, DefaultProperty, Operation, OverWrittenProperty} from '@bame/meta-model';
import {DataFactory} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {InstantiatorListElement, RdfModel} from '@bame/rdf/utils';

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
    const bamm = this.metaModelElementInstantiator.bamm;
    const operation = new DefaultOperation(null, null, null, new Array<OverWrittenProperty>(), null);
    const quads = this.resolveQuads(listElement, this.rdfModel);

    operation.setExternalReference(this.rdfModel.isExternalRef);

    this.metaModelElementInstantiator.initBaseProperties(quads, operation, this.rdfModel);
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(operation, this.isIsolated);

    quads.forEach(quad => {
      if (bamm.isInputProperty(quad.predicate.value)) {
        operation.input = this.metaModelElementInstantiator.getProperties(DataFactory.namedNode(quad.subject.value), bamm.InputProperty());
      } else if (bamm.isOutputProperty(quad.predicate.value)) {
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
