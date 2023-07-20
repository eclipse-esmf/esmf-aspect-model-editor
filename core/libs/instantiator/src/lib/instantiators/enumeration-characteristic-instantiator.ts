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
import {NamedNode, Quad, Util} from 'n3';
import {Characteristic, DefaultEntityValue, DefaultEnumeration} from '@ame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {RdfModel} from '@ame/rdf/utils';
import {syncElementWithChildren} from '../helpers';

export class EnumerationCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let enumeration = this.cachedFile.getElement<DefaultEnumeration>(quads[0]?.subject.value);
    if (enumeration) {
      return enumeration;
    }

    const samm = this.metaModelElementInstantiator.samm;
    const sammC = this.metaModelElementInstantiator.sammC;
    enumeration = DefaultEnumeration.createInstance();
    enumeration.fileName = this.metaModelElementInstantiator.fileName;

    for (const quad of quads) {
      if ((samm.isValueProperty(quad.predicate.value) || sammC.isValuesProperty(quad.predicate.value)) && Util.isBlankNode(quad.object)) {
        enumeration.values = this.getEnumerationValues(quad);
      }
    }

    if (enumeration.values[0] instanceof DefaultEntityValue) {
      enumeration.children.push(...(enumeration.values as DefaultEntityValue[]));
    }

    syncElementWithChildren(enumeration);
    return enumeration;
  }

  private getEnumerationValues(quad: Quad): Array<string | DefaultEntityValue> {
    const quads = this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(quad.object.value);
    const isEntityValue = this.isEntityValue(quads?.[0]);

    const values = [];
    for (const entityValueQuad of quads) {
      if (isEntityValue) {
        this.metaModelElementInstantiator.loadEntityValue(entityValueQuad, (ev: DefaultEntityValue) => {
          values.push(ev);
        });
        continue;
      }
      values.push(`${entityValueQuad.object.value}`);
    }
    return values;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.EnumerationCharacteristic().equals(nameNode);
  }

  private isEntityValue(quad: Quad) {
    if (!quad) {
      return false;
    }

    const externalRdfModel = this.metaModelElementInstantiator.getRdfModelByElement(quad.object);
    const rdfModel: RdfModel = externalRdfModel || this.metaModelElementInstantiator.rdfModel;

    // check if it is a valid entity value
    const samm = this.metaModelElementInstantiator.samm;
    const entityValueQuads = rdfModel.store.getQuads(quad.object, null, null, null);
    if (!entityValueQuads.length) {
      return false;
    }

    // check if it is an entity value
    let entityQuads = rdfModel.store.getQuads(entityValueQuads[0]?.object, null, null, null);
    if (!entityQuads.length) {
      const entityRdfModel = this.metaModelElementInstantiator.getRdfModelByElement(entityValueQuads[0]?.object);
      entityQuads = entityRdfModel.store.getQuads(entityValueQuads[0]?.object, null, null, null);
    }

    const rdfTypeQuad = entityQuads.find(({predicate}) => samm.RdfType().equals(predicate));
    if (!rdfTypeQuad) {
      return false;
    }

    return samm.Entity().equals(rdfTypeQuad.object);
  }
}
