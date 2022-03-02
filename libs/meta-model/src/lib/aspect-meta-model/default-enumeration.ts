/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Type} from './type';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {DefaultEntityValue} from './default-entity-value';
import {BaseMetaModelElement} from './base';
import {DefaultEntity, Entity} from './default-entity';

export interface Enumeration extends Characteristic {
  values: Array<DefaultEntityValue | string | number | boolean>;
}

export class DefaultEnumeration extends DefaultCharacteristic implements Enumeration {
  public newDataType: Entity;

  static createInstance() {
    return new DefaultEnumeration(null, null, 'Characteristic', []);
  }

  get className() {
    return 'DefaultEnumeration';
  }

  constructor(
    public metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public values: Array<DefaultEntityValue | string | number | boolean>,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultEntity) {
      this.dataType = null;
      this.values = [];
    }
  }
}
