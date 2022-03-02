/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {AspectModelVisitor} from '@bame/mx-graph';
import {Bamm} from '@bame/vocabulary';
import {Base, BaseMetaModelElement} from './base';
import {QuantityKind} from './default-quantity-kind';

export interface Unit extends BaseMetaModelElement {
  symbol?: string;
  code?: string;
  name: string;
  referenceUnit?: Unit;
  conversionFactor?: string;
  numericConversionFactor?: string;
  quantityKinds?: Array<any>;
}

export class DefaultUnit extends Base implements Unit {
  static createInstance() {
    return new DefaultUnit(null, null, 'Unit');
  }

  get className() {
    return 'DefaultUnit';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public symbol?: string,
    public code?: string,
    public referenceUnit?: Unit,
    public conversionFactor?: string,
    public numericConversionFactor?: string,
    public quantityKinds: Array<QuantityKind> = []
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitUnit(this, context);
  }

  isPredefined(): boolean {
    return this.aspectModelUrn ? this.aspectModelUrn.startsWith(`${Bamm.BASE_URI}unit:${this.metaModelVersion}#`) : false;
  }
}
