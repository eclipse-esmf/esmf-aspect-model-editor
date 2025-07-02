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

import {BaseProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';

export abstract class ModelElement {
  metaModelVersion: string;

  constructor(props: BaseProps) {
    this.metaModelVersion = props.metaModelVersion;
  }

  getMetaModelVersion() {
    return this.metaModelVersion;
  }

  abstract accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T;
}
