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
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultTrait, DefaultValue} from '@esmf/aspect-model-loader';
import {DataFactory, Literal, NamedNode, Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable({providedIn: 'root'})
export class PropertyVisitor extends BaseVisitor<DefaultProperty> {
  public rdfNodeService = inject(RdfNodeService);
  public rdfListService = inject(RdfListService);
  public loadedFilesService = inject(LoadedFilesService);

  private get store(): Store {
    return this.loadedFilesService.currentLoadedFile?.rdfModel?.store;
  }

  private get samm() {
    return this.loadedFilesService.currentLoadedFile?.rdfModel?.samm;
  }

  visit(property: DefaultProperty): DefaultProperty {
    if (property.getExtends() || property.isPredefined || this.loadedFilesService.isElementExtern(property)) {
      return null;
    }

    this.setPrefix(property.aspectModelUrn);
    this.addExtends(property);
    this.addProperties(property);
    this.addCharacteristic(property);
    this.addExampleValue(property);
    return property;
  }

  private addExampleValue(property: DefaultProperty) {
    if (!property.exampleValue) {
      return;
    }

    const exampleValueNode = this.getExampleValueNode(property);

    this.store.addQuad(DataFactory.namedNode(property.aspectModelUrn), this.samm.ExampleValueProperty(), exampleValueNode);
  }

  private getExampleValueNode(property: DefaultProperty): NamedNode<string> | Literal {
    if (property.exampleValue instanceof DefaultValue) {
      return DataFactory.namedNode(property.exampleValue.aspectModelUrn);
    }

    const dataTypeUrn =
      property.characteristic instanceof DefaultTrait
        ? property.characteristic.baseCharacteristic?.dataType?.aspectModelUrn
        : property.characteristic?.dataType?.aspectModelUrn;

    return DataFactory.literal(property.exampleValue.value.toString(), DataFactory.namedNode(dataTypeUrn));
  }

  private addProperties(property: DefaultProperty) {
    this.rdfNodeService.update(property, {
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
      this.samm.CharacteristicProperty(),
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
      this.samm.Extends(),
      DataFactory.namedNode(property.getExtends().aspectModelUrn),
    );
  }
}
