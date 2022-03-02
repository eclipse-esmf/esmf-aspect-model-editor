/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DefaultCollection} from './default-collection';
import {Characteristic} from './default-characteristic';
import {Type} from './type';

export class DefaultSortedSet extends DefaultCollection {
  static createInstance() {
    return new DefaultSortedSet(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultSortedSet';
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
