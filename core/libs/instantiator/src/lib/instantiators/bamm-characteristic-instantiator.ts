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
import {NamedNode} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Characteristic, DefaultCharacteristic, DefaultScalar} from '@ame/meta-model';
import {DataTypeService} from '@ame/shared';

export class BammCharacteristicInstantiator {
  private characteristicInstanceList: {[key: string]: Function} = {};

  private readonly dataTypeService: DataTypeService;

  get predefinedCharacteristics() {
    return this.characteristicInstanceList;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.dataTypeService = metaModelElementInstantiator.rdfModel.dataTypeService;
    const bammc = metaModelElementInstantiator.bammc;
    this.characteristicInstanceList[`${bammc.getNamespace()}Timestamp`] = this.createTimestampCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}Text`] = this.createTextCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}MultiLanguageText`] = this.createMultiLanguageTextCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}Boolean`] = this.createBooleanCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}Locale`] = this.createLocaleCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}Language`] = this.createLanguageCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}UnitReference`] = this.createUnitReferenceCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}ResourcePath`] = this.createResourcePathCharacteristic;
    this.characteristicInstanceList[`${bammc.getNamespace()}MimeType`] = this.createMimeTypeCharacteristic;
  }

  createTextCharacteristic(metaModelElementInstantiator: MetaModelElementInstantiator, dataTypeService: DataTypeService): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('Text'),
      'Text',
      new DefaultScalar(`${dataTypeService.getDataType('string').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Text');
    characteristic.addDescription(
      'en',
      'Describes a Property which contains plain text. ' +
        'This is intended exclusively for human readable strings, not for identifiers, measurement values, etc.'
    );

    return characteristic;
  }

  createTimestampCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService?: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('Timestamp'),
      'Timestamp',
      new DefaultScalar(`${dataTypeService.getDataType('dateTime').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Timestamp');
    characteristic.addDescription('en', 'Describes a Property which contains the date and time with an optional timezone.');

    return characteristic;
  }

  createMultiLanguageTextCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('MultiLanguageText'),
      'MultiLanguageText',
      new DefaultScalar(`${dataTypeService.getDataType('langString').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Multi-Language Text');
    characteristic.addDescription(
      'en',
      'Describes a Property which contains plain text in multiple languages.' +
        ' This is intended exclusively for human readable strings, not for identifiers, measurement values, etc.'
    );

    return characteristic;
  }

  createBooleanCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('Boolean'),
      'Boolean',
      new DefaultScalar(`${dataTypeService.getDataType('boolean').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Boolean');
    characteristic.addDescription('en', 'Represents a boolean value (i.e. a "flag").');

    return characteristic;
  }

  createLocaleCharacteristic(metaModelElementInstantiator: MetaModelElementInstantiator, dataTypeService: DataTypeService): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('Locale'),
      'Locale',
      new DefaultScalar(`${dataTypeService.getDataType('string').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Locale');
    characteristic.addDescription('en', 'Describes a Property containing a locale according to IETF BCP 47, for example "de-DE".');

    return characteristic;
  }

  createLanguageCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('Language'),
      'Language',
      new DefaultScalar(`${dataTypeService.getDataType('string').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Language');
    characteristic.addDescription('en', 'Describes a Property containing a language according to ISO 639-1, for example "de".');

    return characteristic;
  }

  createUnitReferenceCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('UnitReference'),
      'UnitReference',
      new DefaultScalar(`${dataTypeService.getDataType('curie').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Unit Reference');
    characteristic.addDescription('en', 'Describes a Property containing a reference to one of the units in the Unit Catalog.');

    return characteristic;
  }

  createResourcePathCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('ResourcePath'),
      'ResourcePath',
      new DefaultScalar(`${dataTypeService.getDataType('anyURI').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Resource Path');
    characteristic.addDescription('en', 'The path of a resource.');

    return characteristic;
  }

  createMimeTypeCharacteristic(
    metaModelElementInstantiator: MetaModelElementInstantiator,
    dataTypeService: DataTypeService
  ): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.bamm.version,
      metaModelElementInstantiator.bammc.getAspectModelUrn('MimeType'),
      'MimeType',
      new DefaultScalar(`${dataTypeService.getDataType('string').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'MIME Type');
    characteristic.addDescription('en', 'A MIME type as defined in RFC 2046, for example "application/pdf.');

    return characteristic;
  }

  createCharacteristic(name: NamedNode): Characteristic {
    const createFunction = this.characteristicInstanceList[name.value];
    if (createFunction) {
      return createFunction(this.metaModelElementInstantiator, this.dataTypeService);
    } else {
      return null;
    }
  }

  getSupportedCharacteristicNames(): Array<string> {
    return Object.keys(this.characteristicInstanceList);
  }
}
