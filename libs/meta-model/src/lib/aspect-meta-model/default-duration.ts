/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DefaultQuantifiable} from './default-quantifiable';
import {Type} from './type';
import {Unit} from './default-unit';
import {AspectModelVisitor} from '@bame/mx-graph';

export class DefaultDuration extends DefaultQuantifiable {
  static createInstance() {
    return new DefaultDuration(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultDuration';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, dataType?: Type, public unit?: Unit) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }
}
