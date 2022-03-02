/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DefaultQuantifiable} from './default-quantifiable';
import {Type} from './type';
import {Unit} from './default-unit';
import {AspectModelVisitor} from '@bame/mx-graph';

export class DefaultMeasurement extends DefaultQuantifiable {
  static createInstance() {
    return new DefaultMeasurement(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultMeasurement';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, unit: Unit, dataType?: Type) {
    super(metaModelVersion, aspectModelUrn, name, dataType, unit);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }
}
