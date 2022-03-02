/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultCharacteristic} from './default-characteristic';
import {Type} from './type';

export class DefaultCode extends DefaultCharacteristic {
  static createInstance() {
    return new DefaultCode(null, null, 'Characteristic');
  }

  get className() {
    return 'DefaultCode';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public dataType?: Type) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }
}
