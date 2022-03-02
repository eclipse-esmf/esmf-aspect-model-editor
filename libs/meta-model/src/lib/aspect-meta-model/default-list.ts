/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DefaultCollection} from './default-collection';
import {Characteristic} from './default-characteristic';
import {Type} from './type';

export class DefaultList extends DefaultCollection {
  static createInstance() {
    return new DefaultList(null, null, 'Characteristic', null, null);
  }

  get className() {
    return 'DefaultList';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public elementCharacteristic?: Characteristic,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, elementCharacteristic, dataType);
  }
}
