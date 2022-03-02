/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Type} from './type';
import {DefaultEnumeration, Enumeration} from './default-enumeration';
import {DefaultEntityValue} from './default-entity-value';

export interface State extends Enumeration {
  defaultValue: DefaultEntityValue | string | number;
}

export class DefaultState extends DefaultEnumeration implements State {
  static createInstance() {
    return new DefaultState(null, null, 'Characteristic', null, null);
  }

  get className() {
    return 'DefaultState';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    values: Array<DefaultEntityValue | string | number | boolean>,
    public defaultValue: DefaultEntityValue | string | number,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, values, dataType);
  }
}
