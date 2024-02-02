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
import {NamedNode} from 'n3';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Characteristic, DefaultCharacteristic, DefaultScalar} from '@ame/meta-model';
import {DataTypeService} from '@ame/shared';

export class PredefinedCharacteristicInstantiator {
  private characteristicInstanceList: {[key: string]: Function} = {};

  private readonly dataTypeService: DataTypeService;

  get predefinedCharacteristics() {
    return this.characteristicInstanceList;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.dataTypeService = metaModelElementInstantiator.rdfModel.dataTypeService;
    const sammC = metaModelElementInstantiator.sammC;
    this.characteristicInstanceList[`${sammC.getNamespace()}Timestamp`] = this.createTimestampCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}Text`] = this.createTextCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}MultiLanguageText`] = this.createMultiLanguageTextCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}Boolean`] = this.createBooleanCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}Locale`] = this.createLocaleCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}Language`] = this.createLanguageCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}UnitReference`] = this.createUnitReferenceCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}ResourcePath`] = this.createResourcePathCharacteristic;
    this.characteristicInstanceList[`${sammC.getNamespace()}MimeType`] = this.createMimeTypeCharacteristic;
  }

  createTextCharacteristic(metaModelElementInstantiator: MetaModelElementInstantiator, dataTypeService: DataTypeService): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('Text'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('Timestamp'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('MultiLanguageText'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('Boolean'),
      'Boolean',
      new DefaultScalar(`${dataTypeService.getDataType('boolean').isDefinedBy}`)
    );

    characteristic.addPreferredName('en', 'Boolean');
    characteristic.addDescription('en', 'Represents a boolean value (i.e. a "flag").');

    return characteristic;
  }

  createLocaleCharacteristic(metaModelElementInstantiator: MetaModelElementInstantiator, dataTypeService: DataTypeService): Characteristic {
    const characteristic = new DefaultCharacteristic(
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('Locale'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('Language'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('UnitReference'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('ResourcePath'),
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
      metaModelElementInstantiator.samm.version,
      metaModelElementInstantiator.sammC.getAspectModelUrn('MimeType'),
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
