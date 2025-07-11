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

import {RegularExpressionConstraintProps} from '../../shared/props';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface RegularExpressionConstraint extends Constraint {
  value: string;
  getValue(): string;
}

export class DefaultRegularExpressionConstraint extends DefaultConstraint implements RegularExpressionConstraint {
  override className = 'DefaultRegularExpressionConstraint';
  value: string;

  constructor(props: RegularExpressionConstraintProps) {
    super(props);
    this.value = props.value;
  }

  getValue(): string {
    return this.value;
  }
}
