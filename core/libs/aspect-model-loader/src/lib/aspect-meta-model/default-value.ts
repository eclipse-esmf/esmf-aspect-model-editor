/* eslint-disable @typescript-eslint/no-empty-interface */
/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
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

import {ElementSet, NamedElement} from '@esmf/aspect-model-loader';
import {ValueProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';

export interface ValueElement extends NamedElement {
  value: string;
  getValue(): string;
}

export class DefaultValue extends NamedElement implements ValueElement {
  override className = 'DefaultValue';
  value: string;

  constructor(props: ValueProps) {
    super(props);
    this.value = props.value;
  }

  override get children(): ElementSet {
    return new ElementSet();
  }

  getValue(): string {
    return this.value;
  }

  public accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitValue(this, context);
  }
}
