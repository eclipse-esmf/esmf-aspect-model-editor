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
import {Literal, Quad, Quad_Object, Util} from 'n3';
import {Type} from '../../aspect-meta-model';
import {DefaultEnumeration, Enumeration} from '../../aspect-meta-model/characteristic/default-enumeration';
import {DefaultEntityInstance} from '../../aspect-meta-model/default-entity-instance';
import {ScalarValue} from '../../aspect-meta-model/scalar-value';
import {Value} from '../../aspect-meta-model/value';
import {BaseInitProps} from '../../shared/base-init-props';
import {Samm} from '../../vocabulary';
import {entityFactory} from '../entity-instantiator';
import {characteristicFactory} from './characteristic-instantiator';
import {CharacteristicInstantiatorUtil} from './characteristic-instantiator-util';

export function enumerationCharacteristicFactory(initProps: BaseInitProps) {
  const {rdfModel, cache} = initProps;
  const {generateCharacteristic, getDataType} = characteristicFactory(initProps);

  function createEnumerationCharacteristic(quad: Quad): Enumeration {
    return generateCharacteristic(quad, (baseProperties, propertyQuads) => {
      const {samm, sammC} = rdfModel;
      const characteristic = new DefaultEnumeration({
        ...baseProperties,
        dataType: getDataType(propertyQuads.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value))),
        values: [],
      });

      for (const propertyQuad of propertyQuads) {
        if (samm.isValueProperty(propertyQuad.predicate.value) || sammC.isValuesProperty(propertyQuad.predicate.value)) {
          if (Util.isBlankNode(propertyQuad.object)) {
            characteristic.values = getEnumerationValues(propertyQuad, characteristic.dataType);
            characteristic.values.forEach(value => value instanceof DefaultEntityInstance && value.addParent(characteristic));
          }
        }
      }
      return characteristic;
    });
  }

  function getEnumerationValues(quad: Quad, dataType: Type): Value[] {
    const quads = rdfModel.resolveBlankNodes(quad.object.value);
    return quads.map(quadValue =>
      Util.isLiteral(quadValue.object)
        ? new ScalarValue({
            value: CharacteristicInstantiatorUtil.resolveValues(quadValue, dataType.urn),
            type: dataType,
          })
        : resolveEntityInstance(quadValue),
    );
  }

  function resolveEntityInstance(quad: Quad): DefaultEntityInstance {
    const {samm, store} = rdfModel;

    const entityInstanceQuads = store.getQuads(quad.object, null, null, null);
    const entityTypeQuad = entityInstanceQuads.find(entityInstanceQuad => entityInstanceQuad.predicate.value === `${Samm.RDF_URI}#type`);

    if (entityTypeQuad) {
      const entity = entityFactory(initProps)(store.getQuads(entityTypeQuad.object, null, null, null));

      // determine the description of the value/instance if defined
      const descriptionQuad = entityInstanceQuads.find(
        quad =>
          quad.predicate.id.toLowerCase().includes('description') &&
          entity.properties.find(
            property => entity.propertiesPayload[property.aspectModelUrn]?.notInPayload === false && quad.predicate.id,
          ),
      );
      const descriptions = new Map<string, string>();
      if (descriptionQuad) {
        entityInstanceQuads
          .filter(quad => quad.predicate.id === descriptionQuad.predicate.id)
          .forEach(quad => descriptions.set(rdfModel.getLocale(quad) || 'en', quad.object.value));
      }

      // create the related instance and attach the meta model element to it
      const entityInstance = new DefaultEntityInstance({
        name: quad.object.value.split('#')[1],
        aspectModelUrn: quad.object.value,
        metaModelVersion: samm.version,
        type: entity,
        descriptions,
      });

      entityInstanceQuads.forEach(quad => {
        if (
          rdfModel.store.getQuads(quad.predicate, null, null, null).length ||
          rdfModel.store.getQuads(null, rdfModel.samm.property(), quad.predicate, null).length
        ) {
          // multiple language quads -> push into an array
          const predicateKey = quad.predicate.value;

          if (entityInstance.assertions.has(predicateKey)) {
            const value = entityInstance.assertions.get(predicateKey);
            const values = isEntityInstance(quad.object) ? [resolveEntityInstance(quad)] : resolveQuadObject(quad);
            entityInstance.assertions.set(predicateKey, Array.isArray(value) ? [...value, ...values] : values);
          } else {
            entityInstance.assertions.set(
              predicateKey,
              isEntityInstance(quad.object) ? [resolveEntityInstance(quad)] : resolveQuadObject(quad),
            );
          }
        }
      });

      return cache.resolveInstance(entityInstance);
    }

    throw new Error(`Could resolve Entity instance ${entityTypeQuad.subject.value}`);
  }

  function resolveQuadObject(quad: Quad): Value[] {
    if (Util.isBlankNode(quad.object)) {
      const resolvedBlankNodes = rdfModel.resolveBlankNodes(quad.object.value);
      return CharacteristicInstantiatorUtil.solveBlankNodeValues([...resolvedBlankNodes]);
    }

    if (
      (quad.object as Literal).datatypeString === Samm.RDF_LANG_STRING ||
      (quad.object as Literal).datatypeString === Samm.XML_LANG_STRING
    ) {
      return [CharacteristicInstantiatorUtil.createLanguageObject(quad)];
    }

    return [new Value(quad.object.value)];
  }

  function isEntityInstance(object: Quad_Object) {
    const {samm, store} = rdfModel;
    const entityInstanceQuads = store.getQuads(object, null, null, null);
    const instanceTypeQuad = entityInstanceQuads.find(q => q.predicate.value === `${Samm.RDF_URI}#type`);
    if (!instanceTypeQuad) return false;

    const entityQuads = store.getQuads(instanceTypeQuad.object, null, null, null);
    const entityTypeQuad = entityQuads.find(q => q.predicate.value === `${Samm.RDF_URI}#type`);

    return samm.Entity().equals(entityTypeQuad.object);
  }

  return {
    createEnumerationCharacteristic,
    getEnumerationValues,
    resolveEntityInstance,
  };
}
