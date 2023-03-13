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

import {IsNamed} from './is-named';
import {Base} from './base';
import {AspectModelVisitor} from '@ame/mx-graph';

export interface QuantityKind extends IsNamed {
  label: string;
}

export class DefaultQuantityKind extends Base implements QuantityKind {
  get className() {
    return 'DefaultQuantityKind';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public label: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitQuantityKind(this, context);
  }
}
