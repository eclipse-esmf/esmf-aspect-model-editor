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

import {NamedNode, Quad, Quad_Subject} from 'n3';
import {DefaultEvent, Event} from '../aspect-meta-model';
import {BaseInitProps} from '../shared/base-init-props';
import {basePropertiesFactory} from './meta-model-element-instantiator';
import {propertyFactory} from './property-instantiator';

export function eventFactory(initProps: BaseInitProps) {
  return (quad: Quad): Event => {
    const rdfModel = initProps.rdfModel;
    const {samm} = rdfModel;
    const modelElementCache = initProps.cache;

    if (modelElementCache.get(quad.object.value)) {
      return modelElementCache.get(quad.object.value);
    }

    const quads = rdfModel.findAnyProperty(quad);
    const baseProperties = basePropertiesFactory(initProps)(quad.object as NamedNode);
    const event = new DefaultEvent({
      ...baseProperties,
      properties: [],
    });

    for (const quad of quads) {
      if (samm.isParametersProperty(quad.predicate.value)) {
        const parametersQuads = rdfModel.resolveBlankNodes(quad.object.value);
        event.properties = parametersQuads.map(input => {
          const property = propertyFactory(initProps).createProperty(input).property;
          property.addParent(event);
          return property;
        });
      }
    }

    return modelElementCache.resolveInstance(event);
  };
}

export function getEvents(initProps: BaseInitProps) {
  return (subject: Quad_Subject): Array<Event> => {
    const events: Array<Event> = [];

    const rdfModel = initProps.rdfModel;
    const {samm, store} = rdfModel;

    store.getQuads(subject, samm.EventsProperty(), null, null).forEach(eventQuad => {
      rdfModel
        .resolveBlankNodes(eventQuad.object.value)
        .forEach(resolvedEventQuad => events.push(eventFactory(initProps)(resolvedEventQuad)));
    });

    return events;
  };
}
