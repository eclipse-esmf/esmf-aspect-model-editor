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
import {config} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultProperty, DefaultScalar} from '@esmf/aspect-model-loader';
import {simpleDataTypes} from '../../../../../../../shared/src/lib/constants/xsd-datatypes';

@Injectable({
  providedIn: 'root',
})
export class PredefinedRulesService {
  rules = {
    '([\\w\\.-]+)@([\\w\\.-]+\\.\\w{2,4})': {
      name: 'Email Address',
      elements: [
        {
          label: 'username',
          property: true,
          characteristic: {type: simpleDataTypes?.string, name: 'UsernameCharacteristic'},
        },
        {
          label: '@',
          property: false,
        },
        {
          label: 'host',
          property: true,
          characteristic: {type: simpleDataTypes?.string, name: 'HostCharacteristic'},
        },
      ],
    },
    '(\\d{4})-(\\d{2})-(\\d{2})': {
      name: 'ISO 8601 Date',
      elements: [
        {
          label: 'year',
          property: true,
          characteristic: {type: simpleDataTypes?.int, name: 'YearCharacteristic'},
        },
        {
          label: '-',
          property: false,
        },
        {
          label: 'month',
          property: true,
          characteristic: {type: simpleDataTypes?.int, name: 'MonthCharacteristic'},
        },
        {
          label: '-',
          property: false,
        },
        {
          label: 'day',
          property: true,
          characteristic: {type: simpleDataTypes?.int, name: 'DayCharacteristic'},
        },
      ],
    },
    '0x([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})': {
      name: 'Hex-encoded color',
      elements: [
        {
          label: '0x',
          property: false,
        },
        {
          label: 'red',
          property: true,
          characteristic: {type: simpleDataTypes?.string, name: 'RedCharacteristic'},
        },
        {
          label: 'green',
          property: true,
          characteristic: {type: simpleDataTypes?.string, name: 'GreenCharacteristic'},
        },
        {
          label: 'blue',
          property: true,
          characteristic: {type: simpleDataTypes?.string, name: 'BlueCharacteristic'},
        },
      ],
    },
  };

  constructor(private loadedFiles: LoadedFilesService) {}

  getRule(rule: string) {
    const predefinedRule = this.rules[rule];
    if (!predefinedRule) {
      return null;
    }

    return {
      ...predefinedRule,
      elements: predefinedRule.elements.map(element => (element.property ? this.createProperty(element) : element.label)),
    };
  }

  private createProperty(property): DefaultProperty {
    const namespace = this.loadedFiles.currentLoadedFile.rdfModel.getAspectModelUrn();
    const version = this.loadedFiles.currentLoadedFile.rdfModel.getMetaModelVersion();
    return new DefaultProperty({
      metaModelVersion: version,
      aspectModelUrn: namespace + property.label,
      name: property.label,
      characteristic: this.createCharacteristic(property.characteristic),
    });
  }

  private createCharacteristic(characteristic: any) {
    if (!characteristic) {
      return null;
    }

    const namespace = this.loadedFiles.currentLoadedFile.rdfModel.getAspectModelUrn();
    const version = this.loadedFiles.currentLoadedFile.rdfModel.getMetaModelVersion();
    return new DefaultCharacteristic({
      metaModelVersion: version,
      aspectModelUrn: namespace + characteristic.name,
      name: characteristic.name,
      dataType: new DefaultScalar({urn: characteristic.type.isDefinedBy, metaModelVersion: config.currentSammVersion}),
    });
  }
}
