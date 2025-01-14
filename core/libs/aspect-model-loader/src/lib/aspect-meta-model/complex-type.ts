/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
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

import {use} from 'typescript-mix';
import {ElementSet} from '../shared/elements-set';
import {EntityProps} from '../shared/props';
import {Property} from './default-property';
import {HasExtends} from './has-extends';
import {StructureElement} from './structure-element';
import {Type} from './type';

export interface ComplexType extends Type, StructureElement, HasExtends<ComplexType> {}
export abstract class ComplexType extends StructureElement implements ComplexType {
  @use(Type) declare _: ComplexType;

  isAbstractEntity_ = false;
  extends_: ComplexType = null;
  extendingElements: ComplexType[] = [];

  override get children(): ElementSet {
    const children = [];
    if (this.extends_) {
      children.push(this.extends_);
    }

    return super.children.append(children);
  }

  constructor(props: EntityProps) {
    super(props);
    this.urn = props.aspectModelUrn;
    this.extends_ = props.extends_;
    this.extendingElements = props.extendingElements || [];
    this.isAbstractEntity_ = props.isAbstract;
  }

  override isComplexType() {
    return true;
  }

  isAbstractEntity() {
    return this.isAbstractEntity_;
  }

  getUrn(): string {
    return this.getAspectModelUrn();
  }

  getExtendingElements(): ComplexType[] {
    return this.extendingElements;
  }

  getExtends(): ComplexType {
    return this.extends_;
  }

  setExtends(value: ComplexType): void {
    this.extends_ = value;
  }

  getAllProperties(): Property[] {
    if (this.getExtends()) {
      return [...this.getProperties(), ...this.getExtends().getAllProperties()];
    }

    return [...this.getProperties()];
  }
}
