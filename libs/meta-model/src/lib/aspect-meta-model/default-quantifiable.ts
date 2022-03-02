/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DefaultUnit, Unit} from './default-unit';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {Type} from './type';
import {BaseMetaModelElement} from './base';
import {DefaultScalar} from './default-scalar';

export interface Quantifiable extends Characteristic {
  unit?: Unit;
}

export class DefaultQuantifiable extends DefaultCharacteristic implements Quantifiable {
  static createInstance() {
    return new DefaultQuantifiable(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultQuantifiable';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, dataType?: Type, public unit?: Unit) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.unit && baseMetalModelElement && this.unit.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.unit = null;
    }
    super.delete(baseMetalModelElement);
  }

  update(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultUnit) {
      this.unit = baseMetalModelElement;
    } else if (baseMetalModelElement instanceof DefaultScalar) {
      this.dataType = baseMetalModelElement;
    }
  }
}
