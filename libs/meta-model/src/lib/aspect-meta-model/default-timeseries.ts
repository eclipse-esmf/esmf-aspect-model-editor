/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Characteristic} from './default-characteristic';
import {Type} from './type';
import {DefaultSortedSet} from './default-sorted-set';

export class DefaultTimeSeries extends DefaultSortedSet {
  static createInstance() {
    return new DefaultTimeSeries(null, null, 'Characteristic', null, null);
  }

  get className() {
    return 'DefaultTimeSeries';
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
