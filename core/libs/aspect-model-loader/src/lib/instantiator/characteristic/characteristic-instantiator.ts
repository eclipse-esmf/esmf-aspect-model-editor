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
import {Characteristic, DefaultCharacteristic, DefaultScalar, Entity, Type} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {NamedElementProps} from '../../shared/props';
import {entityFactory} from '../entity-instantiator';
import {basePropertiesFactory} from '../meta-model-element-instantiator';
import {predefinedCharacteristicFactory} from './predefined-characteristic-instantiator';

export function characteristicFactory(initProps: BaseInitProps) {
  const {rdfModel, cache} = initProps;
  const {createPredefinedCharacteristic} = predefinedCharacteristicFactory(initProps);

  function getPredefinedCharacteristic(quad: Quad): DefaultCharacteristic {
    const {sammC} = rdfModel;

    // resolves actual element quad in case of a blank node which is most likely the case for characteristics
    const elementQuad = Util.isBlankNode(quad.object) ? rdfModel.resolveBlankNodes(quad.object.value).shift() : quad;

    // checks if the found quad target a default SAMM-C characteristic e.g. Text or Code in this case
    // return the exiting default characteristic
    return elementQuad.object.value.startsWith(sammC.getNamespace()) ? createPredefinedCharacteristic(elementQuad.object.value) : null;
  }

  function getEffectiveType(quad: Quad): Quad {
    const {samm, store} = rdfModel;

    if (Util.isBlankNode(quad.subject)) {
      const resolvedQuads: Quad[] = samm.isDataTypeProperty(quad.predicate.value) ? [quad] : store.getQuads(quad.subject, null, null, null);
      return resolvedQuads.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value));
    }

    if (quad.predicate.value === `${samm.getRdfSyntaxNameSpace()}type`) {
      const resolvedQuad = store.getQuads(quad.subject, null, null, null);
      return resolvedQuad.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value));
    }

    return quad;
  }

  function isEntity(quad: Quad): boolean {
    const {samm} = rdfModel;

    if (samm.Entity().equals(quad.object) || samm.AbstractEntity().equals(quad.object)) {
      return true;
    }

    const propertyFound = rdfModel.findAnyProperty(quad).find(quadProperty => samm.Entity().equals(quadProperty.subject));

    return !!propertyFound;
  }

  function generateCharacteristicName(characteristic: Characteristic) {
    const initialUrn: string = characteristic.aspectModelUrn;

    // assign a unique random name
    characteristic.name = characteristic.name ? characteristic.name : 'Characteristic' + Math.random().toString(36).substring(2, 9);
    characteristic.aspectModelUrn = `${rdfModel.getAspectModelUrn()}${characteristic.name}`;
    characteristic.syntheticName = true;
    cache.addElement(initialUrn, characteristic);
  }

  function getDataType(quad: Quad): Type {
    const {samm, store} = rdfModel;

    // Not every characteristic has a dataType e.g. the Either characteristic.
    // Thus, null is a valid value and needs to be considered.
    if (!quad) {
      return null;
    }

    if (Util.isBlankNode(quad.object)) {
      quad = rdfModel.resolveBlankNodes(quad.object.value).shift();
    }

    const typeQuad: Quad = quad ? getEffectiveType(quad) : null;

    if (!typeQuad) {
      return null;
    }

    const quadEntity = store.getQuads(typeQuad.object, null, null, null);
    if (quadEntity && quadEntity.length > 0 && isEntity(quadEntity[0])) {
      const entity = entityFactory(initProps)(
        quadEntity,
        quadEntity.find(quad => samm.isRdfTypeProperty(quad.predicate.value) && samm.isAbstractEntity(quad.object.value)) !== undefined,
      );
      return cache.resolveInstance(entity);
    }

    return new DefaultScalar({urn: typeQuad.object.value, metaModelVersion: samm.version});
  }

  function createDefaultCharacteristic(quad: Quad): DefaultCharacteristic {
    const predefinedCharacteristic = getPredefinedCharacteristic(quad);
    if (predefinedCharacteristic) return predefinedCharacteristic;

    return generateCharacteristic<DefaultCharacteristic>(quad, (baseProperties, propertyQuads) => {
      const {samm} = rdfModel;
      return new DefaultCharacteristic({
        ...baseProperties,
        dataType: getDataType(propertyQuads.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value))),
      });
    });
  }

  function generateCharacteristic<C extends Characteristic>(
    quad: Quad,
    characteristicTypeFactory: (baseProperties: NamedElementProps, propertyQuads: Quad[]) => C,
  ): C {
    if (cache.get(quad.object.value)) return cache.get(quad.object.value);

    const isAnonymous = Util.isBlankNode(quad.object);
    const propertyQuads: Quad[] = rdfModel.findAnyProperty(quad);
    const elementQuad = isAnonymous ? rdfModel.resolveBlankNodes(quad.object.value).shift() : propertyQuads.shift();
    const baseProperties = basePropertiesFactory(initProps)(elementQuad.subject);

    const characteristic: C = characteristicTypeFactory(baseProperties, propertyQuads);

    characteristic.anonymous = isAnonymous;
    if (characteristic.dataType?.isComplexType()) {
      (characteristic.dataType as Entity).addParent(characteristic);
    }

    if (characteristic.isAnonymous()) {
      generateCharacteristicName(characteristic);
    }

    return cache.resolveInstance(characteristic);
  }

  return {
    generateCharacteristicName,
    getDataType,
    createDefaultCharacteristic,
    generateCharacteristic,
  };
}
