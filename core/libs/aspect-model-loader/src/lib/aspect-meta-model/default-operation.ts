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
import {OperationProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';
import {Property} from './default-property';
import {NamedElement} from './named-element';

export interface Operation extends NamedElement {
  input: Array<Property>;
  output?: Property;

  /**
   * Gets an input property by name
   *
   * @param name Name of the property
   * @return Property or undefined if no property with the name exists
   */
  getInputProperty(name: string): Property;
}

export class DefaultOperation extends NamedElement implements Operation {
  override className = 'DefaultOperation';

  override get children(): ElementSet {
    const children = [];
    if (this.output instanceof NamedElement) {
      children.push(this.output);
    }

    return new ElementSet(...this.input, ...children);
  }

  input: Property[] = [];
  output: Property;

  constructor(props: OperationProps) {
    super(props);
    this.input = props.input || [];
    this.output = props.output;
  }

  getInputProperty(name: string): Property {
    if (!this.input || !this.input.length) {
      return null;
    }
    return this.input.find(property => property.getName() === name);
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitOperation(this, context);
  }
}
