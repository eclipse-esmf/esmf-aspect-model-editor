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

import {RangeConstraintProps} from '../../shared/props';
import {BoundDefinition} from '../bound-definition';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface RangeConstraint extends Constraint {
  minValue?: number;
  maxValue?: number;
  upperBoundDefinition?: BoundDefinition;
  lowerBoundDefinition?: BoundDefinition;

  getMinValue(): number;
  getMaxValue(): number;
  getUpperBoundDefinition(): BoundDefinition;
  getLowerBoundDefinition(): BoundDefinition;
}

export class DefaultRangeConstraint extends DefaultConstraint implements RangeConstraint {
  override className = 'DefaultRangeConstraint';
  minValue?: number;
  maxValue?: number;
  upperBoundDefinition?: BoundDefinition;
  lowerBoundDefinition?: BoundDefinition;

  constructor(props: RangeConstraintProps) {
    super(props);
    this.minValue = props.minValue;
    this.maxValue = props.maxValue;
    this.lowerBoundDefinition = props.lowerBoundDefinition;
    this.upperBoundDefinition = props.upperBoundDefinition;
  }

  getMinValue(): number {
    return this.minValue;
  }

  getMaxValue(): number {
    return this.maxValue;
  }

  getUpperBoundDefinition(): BoundDefinition {
    return this.upperBoundDefinition;
  }

  getLowerBoundDefinition(): BoundDefinition {
    return this.lowerBoundDefinition;
  }
}
