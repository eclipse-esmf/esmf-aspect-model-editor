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

import {LengthConstraintProps} from '../../shared/props';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface LengthConstraint extends Constraint {
  minValue?: number;
  maxValue?: number;
  getMinValue(): number;
  getMaxValue(): number;
}

export class DefaultLengthConstraint extends DefaultConstraint implements LengthConstraint {
  override className = 'DefaultLengthConstraint';
  minValue?: number;
  maxValue?: number;

  constructor(props: LengthConstraintProps) {
    super(props);
    this.minValue = props.minValue;
    this.maxValue = props.maxValue;
  }

  getMinValue(): number {
    return this.minValue;
  }

  getMaxValue(): number {
    return this.maxValue;
  }
}
