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
import {Property} from '../aspect-meta-model';
import {DefaultProperty} from '../aspect-meta-model/default-property';
import {PropertyPayload} from '../aspect-meta-model/structure-element';
import {BaseInitProps} from '../shared/base-init-props';
import {allCharacteristicsFactory} from './characteristic';
import {basePropertiesFactory} from './meta-model-element-instantiator';

export interface PropertyData {
  property: Property;
  payload: PropertyPayload;
}

export function propertyFactory(initProps: BaseInitProps) {
  const {createCharacteristic} = allCharacteristicsFactory(initProps);

  function getExtends(quads: Array<Quad>) {
    const {samm, store} = initProps.rdfModel;
    const modelElementCache = initProps.cache;

    for (const value of quads) {
      if (samm.isExtends(value.predicate.value)) {
        const cachedProperty = modelElementCache.get<Property>(value.object.value);
        if (cachedProperty) {
          return cachedProperty;
        }

        const quadsAbstractProperty = store.getQuads(value.object, null, null, null);
        const {property: extendedAbstractProperty} = createProperty(store.getQuads(null, null, quadsAbstractProperty[0].subject, null)[0]);
        extendedAbstractProperty.isAbstract = quadsAbstractProperty.some(quad => samm.AbstractProperty().equals(quad.object));
        return modelElementCache.resolveInstance(extendedAbstractProperty);
      }
    }

    return null;
  }

  function createProperty(quad: Quad): PropertyData {
    const rdfModel = initProps.rdfModel;
    const samm = rdfModel.samm;
    const modelElementCache = initProps.cache;

    if (modelElementCache.get(quad.object.value)) {
      return {property: modelElementCache.get(quad.object.value), payload: null};
    }

    const baseProperties = basePropertiesFactory(initProps)(quad.object as NamedNode);
    let propertyQuads: Quad[];

    if (samm.property().equals(quad.predicate)) {
      const [, name] = quad.object.value.split('#');
      name && (baseProperties.name = name);
      name && (baseProperties.aspectModelUrn = quad.object.value);
      propertyQuads = [
        ...rdfModel.store.getQuads(quad.object, null, null, null),
        ...rdfModel.store.getQuads(quad.subject, null, null, null),
      ];
    } else if (samm.Extends().equals(quad.predicate)) {
      const [, name] = quad.object.value.split('#');
      baseProperties.name = `${name}_property_${Math.floor(Math.random() * 5000)}`;
      baseProperties.aspectModelUrn = `${baseProperties.aspectModelUrn.split('#')?.[0]}#${baseProperties.name}`;
      baseProperties.hasSyntheticName = true;
      propertyQuads = rdfModel.store.getQuads(quad.subject, null, null, null);
    } else {
      propertyQuads = rdfModel.store.getQuads(quad.object, null, null, null);
    }

    const property = new DefaultProperty({
      ...baseProperties,
    });
    modelElementCache.resolveInstance(property);

    const payload: PropertyPayload = {} as any;

    for (const propertyQuad of propertyQuads) {
      if (samm.isCharacteristicProperty(propertyQuad.predicate.value)) {
        property.characteristic = createCharacteristic(propertyQuad);
        property.characteristic?.addParent(property);
      } else if (samm.isExampleValueProperty(propertyQuad.predicate.value)) {
        property.exampleValue = propertyQuad.object.value;
      } else if (samm.isNotInPayloadProperty(propertyQuad.predicate.value)) {
        payload.notInPayload = propertyQuad.object.value === 'true';
      } else if (samm.isOptionalProperty(propertyQuad.predicate.value)) {
        payload.optional = propertyQuad.object.value === 'true';
      } else if (samm.isPayloadNameProperty(propertyQuad.predicate.value)) {
        payload.payloadName = propertyQuad.object.value;
      }
    }

    property.extends_ = getExtends(propertyQuads);
    property.extends_?.addParent(property);

    return {property, payload};
  }

  function createProperties(subject: Quad_Subject): Array<PropertyData> {
    const rdfModel = initProps.rdfModel;
    const {samm, store} = rdfModel;
    const properties: Array<PropertyData> = [];

    store.getQuads(subject, samm.PropertiesProperty(), null, null).forEach(propertyQuad => {
      rdfModel
        .resolveBlankNodes(propertyQuad.object.value)
        .filter(
          quad =>
            samm.isRdfFirst(quad.predicate.value) || samm.isReferenceProperty(quad.predicate.value) || samm.isExtends(quad.predicate.value),
        )
        .forEach(quad => properties.push(createProperty(quad)));
    });

    return properties;
  }

  return {
    createProperty,
    createProperties,
  };
}
