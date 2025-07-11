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
import {ScalarProps} from '../../shared/props';
import {ModelVisitor} from '../../visitor/model-visitor';
import {NamedElement} from '../named-element';
import {Type} from '../type';

export class DefaultScalar extends Type {
  override className: string;
  override get children(): ElementSet<NamedElement> {
    throw new Error('Method not implemented.');
  }

  constructor(props: ScalarProps) {
    super(props);
    this.urn = props.urn;
    this.metaModelVersion = props.metaModelVersion;
    this.scalar = true;
    this.name = this.getShortType();
  }

  override isScalar(): boolean {
    return true;
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitScalar(this, context);
  }
}
