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
import {DefaultCharacteristic, DefaultProperty, DefaultScalar, OverWrittenProperty} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';
import {simpleDataTypes} from '../../../../../../../shared/src/lib/constants/xsd-datatypes';

export const predefinedRules = {
  '([\\w\\.-]+)@([\\w\\.-]+\\.\\w{2,4})': {
    name: 'Email Address',
    elements: [
      {
        label: 'username',
        property: true,
        characteristic: {type: simpleDataTypes?.string, name: 'UsernameCharacteristic'}
      },
      {
        label: '@',
        property: false
      },
      {
        label: 'host',
        property: true,
        characteristic: {type: simpleDataTypes?.string, name: 'HostCharacteristic'}
      }
    ]
  },
  '(\\d{4})-(\\d{2})-(\\d{2})': {
    name: 'ISO 8601 Date',
    elements: [
      {
        label: 'year',
        property: true,
        characteristic: {type: simpleDataTypes?.int, name: 'YearCharacteristic'}
      },
      {
        label: '-',
        property: false
      },
      {
        label: 'month',
        property: true,
        characteristic: {type: simpleDataTypes?.int, name: 'MonthCharacteristic'}
      },
      {
        label: '-',
        property: false
      },
      {
        label: 'day',
        property: true,
        characteristic: {type: simpleDataTypes?.int, name: 'DayCharacteristic'}
      }
    ]
  },
  '0x([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})': {
    name: 'Hex-encoded color',
    elements: [
      {
        label: '0x',
        property: false
      },
      {
        label: 'red',
        property: true,
        characteristic: {type: simpleDataTypes?.string, name: 'RedCharacteristic'}
      },
      {
        label: 'green',
        property: true,
        characteristic: {type: simpleDataTypes?.string, name: 'GreenCharacteristic'}
      },
      {
        label: 'blue',
        property: true,
        characteristic: {type: simpleDataTypes?.string, name: 'BlueCharacteristic'}
      }
    ]
  }
};

@Injectable({
  providedIn: 'root'
})
export class PredefinedRulesService {
  constructor(private rdfService: RdfService) {}

  getRule(rule: string) {
    const predefinedRule = predefinedRules[rule];
    if (!predefinedRule) {
      return null;
    }

    return {
      ...predefinedRule,
      elements: predefinedRule.elements.map(element => (element.property ? this.createProperty(element) : element.label))
    };
  }

  private createProperty(property): OverWrittenProperty {
    const namespace = this.rdfService.currentRdfModel.getAspectModelUrn();
    const version = this.rdfService.currentRdfModel.getMetaModelVersion();
    return {
      property: new DefaultProperty(
        version,
        namespace + property.label,
        property.label,
        this.createCharacteristic(property.characteristic)
      ),
      keys: {}
    };
  }

  private createCharacteristic(characteristic: any) {
    if (!characteristic) {
      return null;
    }

    const namespace = this.rdfService.currentRdfModel.getAspectModelUrn();
    const version = this.rdfService.currentRdfModel.getMetaModelVersion();
    return new DefaultCharacteristic(
      version,
      namespace + characteristic.name,
      characteristic.name,
      new DefaultScalar(characteristic.type.isDefinedBy)
    );
  }
}
