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
import {simpleDataTypes} from './constants/xsd-datatypes';
import {GeneralConfig} from './general-config';

@Injectable({
  providedIn: 'root',
})
export class DataTypeService {
  constructor() {
    simpleDataTypes['curie'].isDefinedBy = simpleDataTypes['curie'].isDefinedBy.replace('SAMM_VERSION', GeneralConfig.sammVersion);
  }

  getDataTypes(): any {
    return simpleDataTypes;
  }

  getDataType(key: string): any {
    return simpleDataTypes[key];
  }
}
