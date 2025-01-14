/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {ElementSet} from '../shared/elements-set';
import {UnitProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';
import {QuantityKind} from './default-quantity-kind';
import {NamedElement} from './named-element';

export interface Unit extends NamedElement {
  symbol?: string;
  code?: string;
  name: string;
  referenceUnit?: Unit;
  conversionFactor?: string;
  numericConversionFactor?: number;
  commonCode?: string;
  quantityKinds?: Array<any>;
}

export class DefaultUnit extends NamedElement implements Unit {
  override className = 'DefaultUnit';
  override get children(): ElementSet {
    if (this.referenceUnit instanceof NamedElement) {
      return new ElementSet(this.referenceUnit);
    }

    return new ElementSet();
  }

  symbol?: string;
  code?: string;
  referenceUnit?: DefaultUnit;
  conversionFactor?: string;
  numericConversionFactor?: number;
  commonCode?: string;
  quantityKinds?: Array<QuantityKind>;

  constructor(props: UnitProps) {
    super(props);
    this.symbol = props.symbol;
    this.code = props.code;
    this.referenceUnit = props.referenceUnit;
    this.conversionFactor = props.conversionFactor;
    this.numericConversionFactor = props.numericConversionFactor;
    this.commonCode = props.commonCode;
    this.quantityKinds = props.quantityKinds || [];
  }

  public accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitUnit(this, context);
  }
}
