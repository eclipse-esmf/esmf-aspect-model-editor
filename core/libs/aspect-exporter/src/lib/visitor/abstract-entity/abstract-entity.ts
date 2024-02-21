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
import {ListProperties, RdfListService} from '../../rdf-list';
import {BaseVisitor} from '../base-visitor';
import {DefaultAbstractEntity} from '@ame/meta-model';
import {RdfNodeService} from '../../rdf-node';
import {RdfService} from '@ame/rdf/services';
import {DataFactory, Store} from 'n3';
import {Samm} from '@ame/vocabulary';

@Injectable()
export class AbstractEntityVisitor extends BaseVisitor<DefaultAbstractEntity> {
  private store: Store;
  private samm: Samm;

  constructor(
    public rdfNodeService: RdfNodeService,
    public rdfListService: RdfListService,
    public rdfService: RdfService,
  ) {
    super(rdfService);
  }

  visit(abstractEntity: DefaultAbstractEntity): DefaultAbstractEntity {
    if (abstractEntity.isPredefined()) {
      return null;
    }

    this.store = this.rdfService.currentRdfModel.store;
    this.samm = this.rdfService.currentRdfModel.samm;
    this.setPrefix(abstractEntity.aspectModelUrn);
    const newAspectModelUrn = `${abstractEntity.aspectModelUrn.split('#')[0]}#${abstractEntity.name}`;
    abstractEntity.aspectModelUrn = newAspectModelUrn;
    this.updateProperties(abstractEntity);
    this.updateExtends(abstractEntity);
    return abstractEntity;
  }

  private updateProperties(abstractEntity: DefaultAbstractEntity) {
    this.rdfNodeService.update(abstractEntity, {
      preferredName: abstractEntity.getAllLocalesPreferredNames()?.map(language => ({
        language,
        value: abstractEntity.getPreferredName(language),
      })),
      description: abstractEntity.getAllLocalesDescriptions()?.map(language => ({
        language,
        value: abstractEntity.getDescription(language),
      })),
      see: abstractEntity.getSeeReferences() || [],
    });

    if (abstractEntity.properties?.length) {
      this.rdfListService.push(abstractEntity, ...abstractEntity.properties);
      for (const property of abstractEntity.properties) {
        this.setPrefix(property.property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(abstractEntity, ListProperties.abstractProperties);
    }
  }

  private updateExtends(entity: DefaultAbstractEntity) {
    if (entity.extendedElement?.aspectModelUrn) {
      this.store.addQuad(
        DataFactory.namedNode(entity.aspectModelUrn),
        this.samm.ExtendsProperty(),
        DataFactory.namedNode(entity.extendedElement.aspectModelUrn),
      );
      this.setPrefix(entity.extendedElement.aspectModelUrn);
    }
  }
}
