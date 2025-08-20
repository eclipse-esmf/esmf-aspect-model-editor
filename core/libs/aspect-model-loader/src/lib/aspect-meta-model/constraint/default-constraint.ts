/* eslint-disable @typescript-eslint/no-empty-interface */
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

import {ElementSet} from '../../shared/elements-set';
import {ConstraintProps} from '../../shared/props';
import {ModelVisitor} from '../../visitor/model-visitor';
import {NamedElement} from '../named-element';

export interface Constraint extends NamedElement {}

export class DefaultConstraint extends NamedElement implements Constraint {
  className = 'DefaultConstraint';
  override get children(): ElementSet {
    return new ElementSet();
  }

  constructor(props: ConstraintProps) {
    super(props);
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitConstraint(this, context);
  }
}
