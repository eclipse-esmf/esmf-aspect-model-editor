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
import {AspectModelVisitor} from '@ame/mx-graph';
import {DefaultConstraint} from './default-constraint';

export interface EncodingConstraint {
  value: string;
}

export class DefaultEncodingConstraint extends DefaultConstraint implements EncodingConstraint {
  static createInstance() {
    return new DefaultEncodingConstraint(null, null, 'Constraint', null);
  }

  get className() {
    return 'DefaultEncodingConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public value: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitConstraint(this, context);
  }
}
