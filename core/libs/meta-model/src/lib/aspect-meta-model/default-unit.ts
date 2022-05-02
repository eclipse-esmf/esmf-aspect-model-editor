/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {AspectModelVisitor} from '@ame/mx-graph';
import {Bamm} from '@ame/vocabulary';
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
