/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {Type} from './type';
import {OverWrittenProperty} from './overwritten-property';
import {BaseMetaModelElement} from '@bame/meta-model';
import {DefaultProperty} from './default-property';

export interface StructuredValue extends Characteristic {
  deconstructionRule: string;
  elements: Array<string | OverWrittenProperty>;
}

export class DefaultStructuredValue extends DefaultCharacteristic implements StructuredValue {
  get className() {
    return 'DefaultStructuredValue';
  }

  static createInstance() {
    return new DefaultStructuredValue(null, null, 'Characteristic', null, []);
  }

  delete(modeElement: BaseMetaModelElement | Type) {
    super.delete(modeElement);

    if (modeElement instanceof DefaultProperty) {
      this.elements = this.elements?.filter(element => {
        if (typeof element === 'string') {
          return true;
        }

        if (element.property.aspectModelUrn === modeElement.aspectModelUrn) {
          return false;
        }

        return true;
      });
    }
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public deconstructionRule: string,
    public elements: Array<string | OverWrittenProperty>,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }
}
