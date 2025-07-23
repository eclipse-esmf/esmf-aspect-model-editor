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
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultEntity, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class AbstractEntityVisitor extends BaseVisitor<DefaultEntity> {
  private store: Store;
  private samm: Samm;

  constructor(
    public rdfNodeService: RdfNodeService,
    public rdfListService: RdfListService,
    public loadedFiles: LoadedFilesService,
  ) {
    super(loadedFiles);
  }

  visit(abstractEntity: DefaultEntity): DefaultEntity {
    if (abstractEntity.isPredefined) {
      return null;
    }

    if (!this.loadedFiles.currentLoadedFile) return null;

    this.store = this.loadedFiles.currentLoadedFile.rdfModel.store;
    this.samm = this.loadedFiles.currentLoadedFile.rdfModel.samm;
    this.setPrefix(abstractEntity.aspectModelUrn);
    const newAspectModelUrn = `${abstractEntity.aspectModelUrn.split('#')[0]}#${abstractEntity.name}`;
    abstractEntity.aspectModelUrn = newAspectModelUrn;
    this.updateProperties(abstractEntity);
    this.updateExtends(abstractEntity);
    return abstractEntity;
  }

  private updateProperties(abstractEntity: DefaultEntity) {
    this.rdfNodeService.update(abstractEntity, {
      preferredName: getPreferredNamesLocales(abstractEntity)?.map(language => ({
        language,
        value: abstractEntity.getPreferredName(language),
      })),
      description: getDescriptionsLocales(abstractEntity)?.map(language => ({
        language,
        value: abstractEntity.getDescription(language),
      })),
      see: abstractEntity.see || [],
    });

    if (abstractEntity.properties?.length) {
      this.rdfListService.push(abstractEntity, ...abstractEntity.properties);
      for (const property of abstractEntity.properties) {
        this.setPrefix(property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(abstractEntity, ListProperties.abstractProperties);
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
