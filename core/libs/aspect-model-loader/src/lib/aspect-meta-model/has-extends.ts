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

import {ElementSet} from '../shared/elements-set';
import {ModelVisitor} from '../visitor/model-visitor';
import {NamedElement} from './named-element';

export class HasExtends<T extends NamedElement = NamedElement> extends NamedElement {
  override className = '';
  override get children(): ElementSet {
    return this.extends_ instanceof NamedElement ? new ElementSet(this.extends_) : new ElementSet();
  }

  extends_: T;

  getExtends(): T {
    return this.extends_;
  }

  setExtends(value: T) {
    this.extends_ = value;
  }

  override accept<T, U>(_visitor: ModelVisitor<T, U>, _context: U): T {
    throw new Error('Method not implemented.');
  }
}
