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
import {StructuredValueProps} from '../../shared/props';
import {Property} from '../default-property';
import {NamedElement} from '../named-element';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';

export interface StructuredValue extends Characteristic {
  deconstructionRule: string;
  elements: Array<string | Property>;
  getDeconstructionRule(): string;
  getElements(): (string | Property)[];
}

export class DefaultStructuredValue extends DefaultCharacteristic implements StructuredValue {
  override className = 'DefaultStructuredValue';

  override get children(): ElementSet {
    const children = this.elements.filter(element => element instanceof NamedElement);
    return super.children.append(children as Property[]);
  }

  deconstructionRule: string;
  elements: (string | Property)[];

  constructor(props: StructuredValueProps) {
    super(props);
    this.deconstructionRule = props.deconstructionRule;
    this.elements = props.elements || [];
  }

  getDeconstructionRule(): string {
    return this.deconstructionRule;
  }

  getElements(): (string | Property)[] {
    return this.elements;
  }
}
