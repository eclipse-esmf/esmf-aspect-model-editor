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

export interface FixedPointConstraint {
  scale: number;
  integer: number;
}

export class DefaultFixedPointConstraint extends DefaultConstraint implements FixedPointConstraint {
  static createInstance() {
    return new DefaultFixedPointConstraint(null, null, 'Constraint', null, null);
  }

  get className() {
    return 'DefaultFixedPointConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public scale: number, public integer: number) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
