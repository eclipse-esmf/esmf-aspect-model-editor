/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {AspectModelVisitor} from '@bame/mx-graph';
import {DefaultCharacteristic} from './default-characteristic';
import {Type} from './type';

export class DefaultSingleEntity extends DefaultCharacteristic {
  static createInstance() {
    return new DefaultSingleEntity(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultSingleEntity';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, dataType?: Type) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }
}
