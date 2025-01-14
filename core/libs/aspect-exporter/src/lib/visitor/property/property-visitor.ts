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
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class PropertyVisitor extends BaseVisitor<DefaultProperty> {
  private get store(): Store {
    return this.loadedFiles.currentLoadedFile?.rdfModel?.store;
  }

  constructor(
    public rdfNodeService: RdfNodeService,
    loadedFiles: LoadedFilesService,
  ) {
    super(loadedFiles);
  }

  visit(property: DefaultProperty): DefaultProperty {
    if (property.getExtends() || property.isPredefined) {
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
      preferredName: getPreferredNamesLocales(property).map(language => ({
        language,
        value: property.getPreferredName(language),
      })),
      description: getDescriptionsLocales(property).map(language => ({
        language,
        value: property.getDescription(language),
      })),
      see: property.getSee() || [],
    });
  }

  private addCharacteristic(property: DefaultProperty) {
    if (!property.characteristic) {
      return;
    }

    this.setPrefix(property.characteristic.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.loadedFiles.currentLoadedFile.rdfModel.samm.CharacteristicProperty(),
      DataFactory.namedNode(property.characteristic.aspectModelUrn),
    );
  }

  private addExtends(property: DefaultProperty) {
    if (!property.getExtends()) {
      return;
    }

    this.setPrefix(property.getExtends().aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.loadedFiles.currentLoadedFile.rdfModel.samm.Extends(),
      DataFactory.namedNode(property.getExtends().aspectModelUrn),
    );
  }
}
