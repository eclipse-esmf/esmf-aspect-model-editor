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
import {TraitProps} from '../../shared/props';
import {Constraint} from '../constraint/default-constraint';
import {Type} from '../type';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';

export interface Trait extends Characteristic {
  baseCharacteristic?: Characteristic;
  constraints: Array<Constraint>;
  getBaseCharacteristic(): Characteristic;
  getConstraints(): Constraint[];
}

export class DefaultTrait extends DefaultCharacteristic implements Trait {
  override className = 'DefaultTrait';

  override get children(): ElementSet {
    const children = [];
    if (this.baseCharacteristic) {
      children.push(this.baseCharacteristic);
    }

    if (this.constraints) {
      children.push(...this.constraints);
    }

    return super.children.append(children);
  }

  baseCharacteristic?: Characteristic;
  constraints: Constraint[] = [];

  constructor(props: TraitProps) {
    super(props);
    this.baseCharacteristic = props.baseCharacteristic;
    this.constraints = props.constraints || [];
  }

  getBaseCharacteristic(): Characteristic {
    return this.baseCharacteristic;
  }

  getConstraints(): Constraint[] {
    return this.constraints;
  }

  override getDatatype(): Type {
    return this.baseCharacteristic?.getDatatype();
  }
}
