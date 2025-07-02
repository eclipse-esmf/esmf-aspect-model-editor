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
import {StateProps} from '../../shared/props';
import {NamedElement} from '../named-element';
import {Value} from '../value';
import {DefaultEnumeration, Enumeration} from './default-enumeration';

export interface State extends Enumeration {
  defaultValue: Value;
  getDefaultValue(): Value;
}

export class DefaultState extends DefaultEnumeration implements State {
  override className = 'DefaultState';

  override get children(): ElementSet {
    const children = [];
    if (this.defaultValue instanceof NamedElement) {
      children.push(this.defaultValue);
    }

    return super.children.append(children);
  }

  defaultValue: Value;

  constructor(props: StateProps) {
    super(props);
    this.defaultValue = props.defaultValue;
  }

  getDefaultValue(): Value {
    return this.defaultValue;
  }
}
