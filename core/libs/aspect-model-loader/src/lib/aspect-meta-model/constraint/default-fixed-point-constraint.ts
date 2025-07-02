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

import {FixedPointConstraintProps} from '../../shared/props';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface FixedPointConstraint extends Constraint {
  scale: number;
  integer: number;
  getScale(): number;
  getInteger(): number;
}

export class DefaultFixedPointConstraint extends DefaultConstraint implements FixedPointConstraint {
  override className = 'DefaultFixedPointConstraint';
  scale: number;
  integer: number;

  constructor(props: FixedPointConstraintProps) {
    super(props);
    this.scale = props.scale;
    this.integer = props.integer;
  }

  getScale(): number {
    return this.scale;
  }

  getInteger(): number {
    return this.integer;
  }
}
