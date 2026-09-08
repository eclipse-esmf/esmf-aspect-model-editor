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
import {simpleDataTypes} from '@ame/shared';
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultTrait, DefaultValue} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';
import {CharacteristicVisitor} from '../characteristic/characteristic-visitor';
import {ValueVisitor} from '../value/value-visitor';

@Injectable({providedIn: 'root'})
export class PropertyVisitor extends BaseVisitor<DefaultProperty> {
  public rdfNodeService = inject(RdfNodeService);
  public rdfListService = inject(RdfListService);
  public loadedFilesService = inject(LoadedFilesService);
  public characteristicVisitor = inject(CharacteristicVisitor);
  public valueVisitor = inject(ValueVisitor);

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

    const dataTypeUrn = this.resolveDataTypeUrn(property);

    if (property.exampleValue instanceof DefaultValue) {
      if (property.exampleValue.isAnonymous?.()) {
        const blankNode = DataFactory.blankNode();
        this.store.addQuad(DataFactory.namedNode(property.aspectModelUrn), this.samm.ExampleValueProperty(), blankNode);
        this.valueVisitor.visit(property.exampleValue, blankNode, dataTypeUrn);
        return;
      }

      this.setPrefix(property.exampleValue.aspectModelUrn);
      this.store.addQuad(
        DataFactory.namedNode(property.aspectModelUrn),
        this.samm.ExampleValueProperty(),
        DataFactory.namedNode(property.exampleValue.aspectModelUrn),
      );
      return;
    }

    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.samm.ExampleValueProperty(),
      DataFactory.literal(property.exampleValue.value.toString(), DataFactory.namedNode(dataTypeUrn)),
    );
  }

  private resolveDataTypeUrn(property: DefaultProperty): string {
    const defaultType = simpleDataTypes.string.isDefinedBy;
    if (!property?.characteristic) {
      return defaultType;
    }
    const char = property.characteristic;
    let typeObj: any = null;
    if (char instanceof DefaultTrait) {
      typeObj = char.baseCharacteristic?.dataType;
    } else {
      typeObj = (char as any)?.dataType;
    }

    if (!typeObj) {
      return defaultType;
    }

    if (typeof typeObj === 'string') {
      return typeObj;
    }
    if (typeObj.aspectModelUrn) {
      return typeObj.aspectModelUrn;
    }
    if (typeObj.urn) {
      return typeObj.urn;
    }
    if (typeof typeObj.getUrn === 'function') {
      return typeObj.getUrn();
    }
    return defaultType;
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

    if (property.characteristic.isAnonymous?.()) {
      const blankNode = DataFactory.blankNode();
      this.store.addQuad(DataFactory.namedNode(property.aspectModelUrn), this.samm.CharacteristicProperty(), blankNode);
      this.characteristicVisitor.visit(property.characteristic, blankNode);
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
