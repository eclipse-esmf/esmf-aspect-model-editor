/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {AspectModelVisitor} from '@ame/mx-graph';
import {Base, BaseMetaModelElement} from './base';
import {DefaultEntity} from './default-entity';
import {DefaultEnumeration} from './default-enumeration';
import {DefaultProperty} from './default-property';
import {OverWrittenProperty} from './overwritten-property';

export interface EntityValueProperty {
  key: OverWrittenProperty;
  value: string | number | boolean | DefaultEntityValue;
  isComplex?: boolean;
}

export interface EntityValueProperties {
  properties: EntityValueProperty[];
  parents: DefaultEnumeration[];
}

export interface EntityValue extends BaseMetaModelElement, EntityValueProperties {}

// Draft class, to be updated if needed
export class DefaultEntityValue extends Base implements EntityValue {
  public properties: EntityValueProperty[] = [];
  public parents: DefaultEnumeration[] = [];

  static createInstance() {
    return new DefaultEntityValue(null, 'EntityValue', null, null, []);
  }

  get className() {
    return 'DefaultEntityValue';
  }

  constructor(
    public metaModelVersion: string,
    public name: string,
    public aspectModelUrn: string,
    public entity: DefaultEntity,
    properties?: OverWrittenProperty[]
  ) {
    super(metaModelVersion, aspectModelUrn, name);
    this.properties = properties?.map(key => ({key, value: ''})) || [];
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitEntityValue(this, context);
  }

  public addProperty(overWrittenProperty: OverWrittenProperty, value: string | DefaultEntityValue = '') {
    this.properties.push({key: overWrittenProperty, value});
  }

  public removeProperty(property: DefaultProperty) {
    this.properties = this.properties.filter(({key}) => key.property.aspectModelUrn !== property.aspectModelUrn);
  }

  public addParent(characteristic: DefaultEnumeration) {
    this.parents.push(characteristic);
  }

  public removeParent(characteristic: DefaultEnumeration) {
    this.parents = this.parents.filter(parent => parent.aspectModelUrn !== characteristic.aspectModelUrn);
  }
}
