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
import {Aspect, DefaultCollection, PropertyUrn} from '../aspect-meta-model';
import {DefaultAspect} from '../aspect-meta-model/default-aspect';
import {PropertyPayload} from '../aspect-meta-model/structure-element';
import {BaseInitProps} from '../shared/base-init-props';
import {getEvents} from './event-instantiator';
import {basePropertiesFactory} from './meta-model-element-instantiator';
import {getOperations} from './operation-instantiator';
import {propertyFactory} from './property-instantiator';

export function aspectFactory(initProps: BaseInitProps) {
  const {cache} = initProps;

  function getAspectQuad(aspectModelUrn?: string): Quad {
    const {rdfModel} = initProps;
    const {samm, store} = rdfModel;

    const aspectQuad = store.getQuads(null, samm.RdfType(), samm.Aspect(), null).find((quad, index, foundQuads) => {
      if (foundQuads.length > 1 && aspectModelUrn == undefined) {
        throw new Error('More than one aspect found. Please provide the aspectModelUrn to load the desired one.');
      }
      return foundQuads.length == 1 || (aspectModelUrn && quad.subject.value === aspectModelUrn);
    });

    if (!aspectQuad) {
      throw new Error('No aspect found. Please verify if the aspectModelUrn is correct and the ttl includes an aspect definition.');
    }

    return aspectQuad;
  }

  return (aspectModelUrn?: string): Aspect => {
    let aspectQuad: Quad;
    try {
      aspectQuad = getAspectQuad(aspectModelUrn);
    } catch {
      return null;
    }
    const aspectNode = aspectQuad.subject;

    if (cache.get(aspectNode.value)) {
      return cache.get(aspectNode.value);
    }

    const {createProperties} = propertyFactory(initProps);
    const baseProperties = basePropertiesFactory(initProps)(aspectNode);
    const propertiesData = createProperties(aspectNode);
    const operations = getOperations(initProps)(aspectNode);
    const events = getEvents(initProps)(aspectNode);

    const properties = propertiesData.map(({property}) => property);
    const propertiesPayload: Record<PropertyUrn, PropertyPayload> = propertiesData.reduce((acc, {property, payload}) => {
      acc[property.aspectModelUrn] = payload;
      return acc;
    }, {});

    const aspect = new DefaultAspect({
      metaModelVersion: baseProperties.metaModelVersion,
      aspectModelUrn: baseProperties.aspectModelUrn,
      hasSyntheticName: baseProperties.hasSyntheticName,
      properties,
      operations,
      events,
      name: baseProperties.name,
      isCollectionAspect: properties.some(property => property.characteristic instanceof DefaultCollection),
    });

    aspect.propertiesPayload = propertiesPayload;

    properties.forEach(property => property.addParent(aspect));
    operations.forEach(operation => operation.addParent(aspect));
    events.forEach(event => event.addParent(aspect));

    return cache.resolveInstance(aspect);
  };
}
