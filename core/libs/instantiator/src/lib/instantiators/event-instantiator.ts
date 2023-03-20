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

import {DefaultEvent, Event, OverWrittenProperty} from '@ame/meta-model';
import {DataFactory} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {InstantiatorListElement, RdfModel} from '@ame/rdf/utils';

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
    const samm = this.metaModelElementInstantiator.samm;
    const event = new DefaultEvent(null, null, null, new Array<OverWrittenProperty>());
    const quads = this.resolveQuads(listElement, this.rdfModel);

    event.setExternalReference(this.rdfModel.isExternalRef);
    event.fileName = this.metaModelElementInstantiator.fileName;

    this.metaModelElementInstantiator.initBaseProperties(quads, event, this.rdfModel);
    // resolving element to not enter in infinite loop
    this.currentCachedFile.resolveElement(event, this.isIsolated);

    quads.forEach(quad => {
      if (samm.isParametersProperty(quad.predicate.value)) {
        event.parameters = this.metaModelElementInstantiator.getProperties(
          DataFactory.namedNode(quad.subject.value),
          samm.ParametersProperty()
        );
      }
    });

    return event;
  }

  private resolveQuads(element: InstantiatorListElement, rdfModel: RdfModel) {
    return element.quad ? rdfModel.findAnyProperty(DataFactory.namedNode(element.quad.value)) : [];
  }
}
