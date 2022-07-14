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

import {DefaultConstraint} from './default-constraint';
import {BoundDefinition} from './bound-definition';

export interface RangeConstraint {
  minValue?: number;
  maxValue?: number;
}

export class DefaultRangeConstraint extends DefaultConstraint implements RangeConstraint {
  static createInstance() {
    return new DefaultRangeConstraint(null, null, 'Constraint', BoundDefinition.LESS_THAN, BoundDefinition.GREATER_THAN, null, null);
  }

  get className() {
    return 'DefaultRangeConstraint';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public upperBoundDefinition: BoundDefinition,
    public lowerBoundDefinition: BoundDefinition,
    public minValue?: any,
    public maxValue?: any
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
