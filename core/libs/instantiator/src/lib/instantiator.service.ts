/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {RdfModelUtil} from '@ame/rdf/utils';
import {Injectable} from '@angular/core';
import {CacheStrategy, NamedElement, RdfModel, useLoader} from '@esmf/aspect-model-loader';
import {NamedNode, Triple, Util} from 'n3';

@Injectable({
  providedIn: 'root',
})
export class InstantiatorService {
  public instantiateRemainingElements(rdfModel: RdfModel, cache: CacheStrategy) {
    const uniqueSubjects: string[] = rdfModel.store
      .getSubjects(null, null, null)
      .reduce(
        (subjects, subject) => (!Util.isBlankNode(subject) && !cache.get(subject.value) ? [...subjects, subject.value] : subjects),
        [],
      );

    for (const subject of uniqueSubjects) {
      const element = this.instantiateElement(rdfModel, cache, subject);
      if (element) cache.resolveInstance(element);
    }
  }

  public instantiateElement(rdfModel: RdfModel, cache: CacheStrategy, subject: string): NamedElement {
    const {
      createProperty,
      createOperation,
      createEvent,
      createUnit,
      createEntity,
      createConstraint,
      createCharacteristic,
      resolveEntityInstance,
    } = useLoader({rdfModel, cache});

    const {samm, sammC} = rdfModel;
    const elementType = rdfModel.store.getObjects(subject, rdfModel.samm.RdfType(), null)?.[0]?.value;
    if (samm.Property().value === elementType) {
      return createProperty(new Triple(null, null, new NamedNode(subject))).property;
    }

    if (samm.AbstractProperty().value === elementType) {
      const {property} = createProperty(new Triple(null, null, new NamedNode(subject)));
      property.isAbstract = true;
      return property;
    }

    if (elementType.endsWith('Constraint')) {
      return createConstraint(new Triple(new NamedNode(subject), null, null));
    }

    if (sammC.isStandardCharacteristic(elementType) || samm.Characteristic().value === elementType) {
      return createCharacteristic(new Triple(null, null, new NamedNode(subject)));
    }

    if (samm.Operation().value === elementType) {
      return createOperation(new Triple(new NamedNode(subject), null, null));
    }

    if (samm.Event().value === elementType) {
      return createEvent(new Triple(null, null, new NamedNode(subject)));
    }

    if (samm.Unit().value === elementType) {
      return createUnit(subject);
    }

    if (samm.Entity().value === elementType) {
      return createEntity(rdfModel.store.getQuads(subject, null, null, null));
    }

    if (samm.isAbstractEntity(subject)) {
      return createEntity(rdfModel.store.getQuads(subject, null, null, null), true);
    }

    if (RdfModelUtil.isEntityValue(subject, rdfModel)) {
      return resolveEntityInstance(new Triple(null, null, new NamedNode(subject)));
    }

    return null;
  }
}
