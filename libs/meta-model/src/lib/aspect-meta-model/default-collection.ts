/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Type} from './type';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {BaseMetaModelElement} from './base';
import {DefaultEntity} from './default-entity';
import {AspectModelVisitor} from '@bame/mx-graph';

export interface Collection extends Characteristic {
  elementCharacteristic?: Characteristic;
}

export class DefaultCollection extends DefaultCharacteristic implements Collection {
  static createInstance() {
    return new DefaultCollection(null, null, 'Characteristic');
  }

  get className() {
    return 'DefaultCollection';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public elementCharacteristic?: Characteristic,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultEntity) {
      this.dataType = null;
    } else if (this.elementCharacteristic && this.elementCharacteristic.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.elementCharacteristic = null;
    }
  }

  update(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultCharacteristic) {
      this.elementCharacteristic = baseMetalModelElement;
    }
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }
}
