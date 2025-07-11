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

import {ScalarProps} from '../shared/props';
import {NamedElement} from './named-element';

export abstract class Type extends NamedElement {
  urn: string;
  scalar: boolean;
  complexType: boolean;

  constructor(props: ScalarProps) {
    super({...props, aspectModelUrn: props.urn, name: ''});
    this.urn = props.urn;
    this.scalar = Boolean(props.scalar);
    this.complexType = Boolean(props.complexType);
  }

  getShortType(): string {
    return this.urn?.split('#')?.[1] || null;
  }

  getUrn(): string {
    return this.urn;
  }

  isScalar(): boolean {
    return this.scalar;
  }

  isComplexType(): boolean {
    return this.complexType;
  }
}
