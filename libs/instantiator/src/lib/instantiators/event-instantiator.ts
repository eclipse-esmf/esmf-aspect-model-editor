/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultEvent, OverWrittenProperty, Event} from '@bame/meta-model';
import {DataFactory} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {InstantiatorListElement, RdfModel} from '@bame/rdf/utils';

export class EventInstantiator {
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

  public createEvent(listElement: InstantiatorListElement): Event {
    const event = this.currentCachedFile.getElement<DefaultEvent>(listElement.quad.value, this.isIsolated);
    return event ? event : this.constructEvent(listElement);
  }

  constructEvent(listElement: InstantiatorListElement): Event {
    const bamm = this.metaModelElementInstantiator.bamm;
    const event = new DefaultEvent(null, null, null, new Array<OverWrittenProperty>());
    const quads = this.resolveQuads(listElement, this.rdfModel);

    event.setExternalReference(this.rdfModel.isExternalRef);

    this.metaModelElementInstantiator.initBaseProperties(quads, event, this.rdfModel);
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(event, this.isIsolated);

    quads.forEach(quad => {
      if (bamm.isParametersProperty(quad.predicate.value)) {
        event.parameters = this.metaModelElementInstantiator.getProperties(DataFactory.namedNode(quad.subject.value), bamm.ParametersProperty());
      }
    });

    return event;
  }

  private resolveQuads(element: InstantiatorListElement, rdfModel: RdfModel) {
    return element.quad ? rdfModel.findAnyProperty(DataFactory.namedNode(element.quad.value)) : [];
  }
}
