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
import {PropertyProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';
import {Characteristic} from './characteristic/default-characteristic';
import {HasExtends} from './has-extends';
import {NamedElement} from './named-element';

export interface Property extends NamedElement, HasExtends<Property> {
  characteristic: Characteristic;
  exampleValue: string;
  isAbstract: boolean;
}

export class DefaultProperty extends NamedElement implements Property {
  override className = 'DefaultProperty';
  override get children(): ElementSet {
    const children = new ElementSet();
    if (this.extends_ instanceof NamedElement) {
      children.push(this.extends_);
    }

    if (this.characteristic instanceof NamedElement) {
      children.push(this.characteristic);
    }

    return children;
  }

  extends_: Property;
  characteristic: Characteristic;
  exampleValue: string;
  isAbstract: boolean;

  constructor(props: PropertyProps) {
    super(props);
    this.characteristic = props.characteristic || null;
    this.exampleValue = props.exampleValue || null;
    this.extends_ = props.extends_;
    this.isAbstract = Boolean(props.isAbstract);
  }

  getExtends(): Property {
    return this.extends_;
  }

  setExtends(value: Property): void {
    this.extends_ = value;
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitProperty(this, context);
  }
}
