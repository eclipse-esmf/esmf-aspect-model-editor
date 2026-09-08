/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {LoadedFilesService} from '@ame/cache';
import {RdfModelUtil} from '@ame/rdf/utils';
import {inject, Injectable} from '@angular/core';
import {CacheStrategy, NamedElement, RdfModel, useLoader} from '@esmf/aspect-model-loader';
import {NamedNode, Triple, Util} from 'n3';

@Injectable({providedIn: 'root'})
export class InstantiatorService {
  private readonly loadedFilesService = inject(LoadedFilesService);

  public instantiateRemainingElements(mergedRdfModel: RdfModel, currentRdfModel: RdfModel, cache: CacheStrategy): void {
    const subjects = currentRdfModel.store.getSubjects(null, null, null);
    const uniqueSubjects = new Set<string>();

    for (const subject of subjects) {
      if (!Util.isBlankNode(subject) && !cache.get(subject.value)) {
        uniqueSubjects.add(subject.value);
      }
    }

    for (const subject of uniqueSubjects) {
      const element = this.instantiateElement(mergedRdfModel, cache, subject);
      if (element) cache.resolveInstance(element);
    }
  }

  public instantiateElement(rdfModel: RdfModel, cache: CacheStrategy, subject: string): NamedElement | null {
    const {
      createProperty,
      createOperation,
      createEvent,
      createUnit,
      createEntity,
      createValue,
      createConstraint,
      createCharacteristic,
      resolveEntityInstance,
    } = useLoader({rdfModel, cache});

    const {samm, sammC} = rdfModel;
    const elementType = rdfModel.store.getObjects(subject, rdfModel.samm.RdfType(), null)?.[0]?.value;
    if (samm.Property().value === elementType) {
      return createProperty(new Triple(null as never, null as never, new NamedNode(subject))).property;
    }

    if (samm.AbstractProperty().value === elementType) {
      const {property} = createProperty(new Triple(null as never, null as never, new NamedNode(subject)));
      property.isAbstract = true;
      return property;
    }

    if (elementType?.endsWith('Constraint')) {
      return createConstraint(new Triple(new NamedNode(subject), null as never, new NamedNode(subject)));
    }

    if (elementType && (sammC.isStandardCharacteristic(elementType) || samm.Characteristic().value === elementType)) {
      return createCharacteristic(new Triple(null as never, null as never, new NamedNode(subject)));
    }

    if (samm.Operation().value === elementType) {
      return createOperation(new Triple(new NamedNode(subject), null as never, null as never));
    }

    if (samm.Event().value === elementType) {
      return createEvent(new Triple(null as never, null as never, new NamedNode(subject)));
    }

    if (samm.Unit().value === elementType) {
      return createUnit(subject);
    }

    if (samm.Entity().value === elementType) {
      return createEntity(rdfModel.store.getQuads(subject, null, null, null));
    }

    if (samm.Value().value === elementType) {
      return createValue(rdfModel.store.getQuads(subject, null, null, null));
    }

    if (samm.isAbstractEntity(elementType)) {
      return createEntity(rdfModel.store.getQuads(subject, null, null, null), true);
    }

    if (RdfModelUtil.isEntityInstance(subject, this.loadedFilesService)) {
      return resolveEntityInstance(new Triple(null as never, null as never, new NamedNode(subject)));
    }

    return null;
  }
}
