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

import {Injectable} from '@angular/core';
import {ListProperties, RdfListService} from '../../rdf-list';
import {BaseVisitor} from '../base-visitor';
import {DefaultCharacteristic, DefaultEntity} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {RdfService} from '@ame/rdf/services';
import {DataFactory, Store} from 'n3';
import {Samm} from '@ame/vocabulary';

@Injectable()
export class EntityVisitor extends BaseVisitor<DefaultEntity> {
  private store: Store;
  private samm: Samm;

  constructor(
    public rdfNodeService: RdfNodeService,
    public graphService: MxGraphService,
    public rdfListService: RdfListService,
    public rdfService: RdfService
  ) {
    super(rdfService);
  }

  visit(entity: DefaultEntity): DefaultEntity {
    if (entity.isPredefined()) {
      return null;
    }

    this.store = this.rdfService.currentRdfModel.store;
    this.samm = this.rdfService.currentRdfModel.samm;
    this.setPrefix(entity.aspectModelUrn);
    const newAspectModelUrn = `${entity.aspectModelUrn.split('#')[0]}#${entity.name}`;
    this.updateParents(entity);
    entity.aspectModelUrn = newAspectModelUrn;
    this.updateProperties(entity);
    this.updateExtends(entity);
    return entity;
  }

  private updateProperties(entity: DefaultEntity) {
    this.rdfListService.setRdfModel(this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel);
    this.rdfNodeService.update(entity, {
      preferredName: entity.getAllLocalesPreferredNames()?.map(language => ({
        language,
        value: entity.getPreferredName(language),
      })),
      description: entity.getAllLocalesDescriptions()?.map(language => ({
        language,
        value: entity.getDescription(language),
      })),
      see: entity.getSeeReferences() || [],
    });

    if (entity.properties?.length) {
      this.rdfListService.push(entity, ...entity.properties);
      for (const property of entity.properties) {
        !property.property?.extendedElement && this.setPrefix(property.property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(entity, ListProperties.properties);
    }
  }

  private updateParents(entity: DefaultEntity) {
    const parents = entity.parents.filter(metaModelElement => metaModelElement instanceof DefaultCharacteristic);

    for (const parent of parents) {
      this.rdfNodeService.update(parent, {dataType: entity.aspectModelUrn});
    }
  }

  private updateExtends(entity: DefaultEntity) {
    if (entity.extendedElement?.aspectModelUrn) {
      this.store.addQuad(
        DataFactory.namedNode(entity.aspectModelUrn),
        this.samm.ExtendsProperty(),
        DataFactory.namedNode(entity.extendedElement.aspectModelUrn)
      );
      this.setPrefix(entity.extendedElement.aspectModelUrn);
    }
  }
}
