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

import {DefaultConstraint} from './default-constraint';

export interface RegularExpressionConstraint {
  value: string;
}

export class DefaultRegularExpressionConstraint extends DefaultConstraint implements RegularExpressionConstraint {
  static createInstance() {
    return new DefaultRegularExpressionConstraint(null, null, 'Constraint', null);
  }

  get className() {
    return 'DefaultRegularExpressionConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public value: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
