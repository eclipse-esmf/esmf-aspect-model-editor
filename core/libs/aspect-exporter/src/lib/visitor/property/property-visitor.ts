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

import {Injectable} from '@angular/core';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {RdfNodeService} from '../../rdf-node';
import {DefaultProperty} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';

@Injectable()
export class PropertyVisitor extends BaseVisitor<DefaultProperty> {
  private get store(): Store {
    return this.rdfNodeService.modelService.currentRdfModel.store;
  }

  constructor(
    public rdfNodeService: RdfNodeService,
    rdfService: RdfService,
  ) {
    super(rdfService);
  }

  visit(property: DefaultProperty): DefaultProperty {
    if (property.extendedElement || property.isPredefined()) {
      return null;
    }

    this.setPrefix(property.aspectModelUrn);
    this.addExtends(property);
    this.addProperties(property);
    this.addCharacteristic(property);
    return property;
  }

  private addProperties(property: DefaultProperty) {
    this.rdfNodeService.update(property, {
      exampleValue: property.exampleValue,
      preferredName: property.getAllLocalesPreferredNames().map(language => ({
        language,
        value: property.getPreferredName(language),
      })),
      description: property.getAllLocalesDescriptions().map(language => ({
        language,
        value: property.getDescription(language),
      })),
      see: property.getSeeReferences() || [],
    });
  }

  private addCharacteristic(property: DefaultProperty) {
    if (!property.characteristic) {
      return;
    }

    this.setPrefix(property.characteristic.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.rdfService.currentRdfModel.samm.CharacteristicProperty(),
      DataFactory.namedNode(property.characteristic.aspectModelUrn),
    );
  }

  private addExtends(property: DefaultProperty) {
    if (!property.extendedElement) {
      return;
    }

    this.setPrefix(property.extendedElement.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.rdfService.currentRdfModel.samm.ExtendsProperty(),
      DataFactory.namedNode(property.extendedElement.aspectModelUrn),
    );
  }
}
