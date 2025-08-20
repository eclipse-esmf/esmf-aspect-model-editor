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

import {ScalarValueProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';
import {Value} from './value';

export class ScalarValue extends Value {
  constructor(props: ScalarValueProps) {
    super(props.value);
    this.value = props.value;
    this.type = props.type;
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitScalarValue(this, context);
  }
}
