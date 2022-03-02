/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AspectModelVisitor} from '@bame/mx-graph';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {BaseMetaModelElement} from './base';

export interface Either extends Characteristic {
  left: Characteristic;
  right: Characteristic;
}

export class DefaultEither extends DefaultCharacteristic implements Either {
  static createInstance() {
    return new DefaultEither(null, null, 'Characteristic', null, null);
  }

  get className() {
    return 'DefaultEither';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public left: Characteristic, public right: Characteristic) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.left?.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.left = null;
    } else if (this.right?.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.right = null;
    }
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }
}
