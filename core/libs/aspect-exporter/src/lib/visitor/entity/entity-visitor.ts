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

import {LoadedFilesService} from '@ame/cache';
import {MxGraphService} from '@ame/mx-graph';
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class EntityVisitor extends BaseVisitor<DefaultEntity> {
  private store: Store;
  private samm: Samm;

  constructor(
    public rdfNodeService: RdfNodeService,
    public graphService: MxGraphService,
    public rdfListService: RdfListService,
    public loadedFiles: LoadedFilesService,
  ) {
    super(loadedFiles);
  }

  visit(entity: DefaultEntity): DefaultEntity {
    if (entity.isPredefined) {
      return null;
    }

    this.store = this.loadedFiles.currentLoadedFile.rdfModel.store;
    this.samm = this.loadedFiles.currentLoadedFile.rdfModel.samm;

    this.setPrefix(entity.aspectModelUrn);
    const newAspectModelUrn = `${entity.aspectModelUrn.split('#')[0]}#${entity.name}`;
    this.updateParents(entity);
    entity.aspectModelUrn = newAspectModelUrn;
    this.updateProperties(entity);
    this.updateExtends(entity);
    return entity;
  }

  private updateProperties(entity: DefaultEntity) {
    this.rdfNodeService.update(entity, {
      preferredName: getPreferredNamesLocales(entity)?.map(language => ({
        language,
        value: entity.getPreferredName(language),
      })),
      description: getDescriptionsLocales(entity)?.map(language => ({
        language,
        value: entity.getDescription(language),
      })),
      see: entity.getSee() || [],
    });

    if (entity.properties?.length) {
      this.rdfListService.push(entity, ...entity.properties);
      for (const property of entity.properties) {
        !property?.extends_ && this.setPrefix(property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(entity, ListProperties.properties);
    }
  }

  private updateParents(entity: DefaultEntity) {
    for (const parent of entity.parents || []) {
      parent instanceof DefaultCharacteristic && this.rdfNodeService.update(parent, {dataType: entity.aspectModelUrn});
    }
  }

  private updateExtends(entity: DefaultEntity) {
    if (entity.getExtends()?.aspectModelUrn) {
      this.store.addQuad(
        DataFactory.namedNode(entity.aspectModelUrn),
        this.samm.Extends(),
        DataFactory.namedNode(entity.getExtends().aspectModelUrn),
      );
      this.setPrefix(entity.getExtends().aspectModelUrn);
    }
  }
}
