/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {MxGraphHelper} from '@ame/mx-graph';
import {RdfNodeService} from '../../rdf-node';
import {DefaultProperty} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';

@Injectable()
export class PropertyVisitor extends BaseVisitor<DefaultProperty> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  constructor(private rdfNodeService: RdfNodeService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultProperty {
    const property: DefaultProperty = MxGraphHelper.getModelElement<DefaultProperty>(cell);
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
      name: property.name,
    });
  }

  private addCharacteristic(property: DefaultProperty) {
    if (!property.characteristic) {
      return;
    }

    this.setPrefix(property.characteristic.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.rdfService.currentRdfModel.BAMM().CharacteristicProperty(),
      DataFactory.namedNode(property.characteristic.aspectModelUrn)
    );
  }

  private addExtends(property: DefaultProperty) {
    if (!property.extendedElement) {
      return;
    }

    this.setPrefix(property.extendedElement.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.rdfService.currentRdfModel.BAMM().ExtendsProperty(),
      DataFactory.namedNode(property.extendedElement.aspectModelUrn)
    );
  }
}
