/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {simpleDataTypes} from './constants/xsd-datatypes';
import {GeneralConfig} from './general-config';

@Injectable({
  providedIn: 'root',
})
export class DataTypeService {
  constructor() {
    simpleDataTypes['curie'].isDefinedBy = simpleDataTypes['curie'].isDefinedBy.replace('BAMM_VERSION', GeneralConfig.bammVersion);
  }

  getDataTypes(): any {
    return simpleDataTypes;
  }

  getDataType(key: string): any {
    return simpleDataTypes[key];
  }
}
