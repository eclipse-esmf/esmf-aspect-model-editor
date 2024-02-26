/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {Base, BaseMetaModelElement, ModelRelationArray} from './base';
import {DefaultEntity} from './default-entity';
import {DefaultEnumeration} from './default-enumeration';
import {DefaultProperty} from './default-property';
import {OverWrittenProperty} from './overwritten-property';

export interface EntityValueProperty {
  key: OverWrittenProperty;
  value: string | number | boolean | DefaultEntityValue | LangStringProperty;
  isComplex?: boolean;
}

export interface LangStringProperty {
  value: string;
  language: string;
}

export interface EntityValueProperties {
  properties: EntityValueProperty[];
}

export interface EntityValue extends BaseMetaModelElement, EntityValueProperties {}

// Draft class, to be updated if needed
export class DefaultEntityValue extends Base implements EntityValue {
  public properties: EntityValueProperty[] = [];
  public parents: any = new ModelRelationArray<DefaultEnumeration | DefaultEntityValue>();

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
    properties?: OverWrittenProperty[],
  ) {
    super(metaModelVersion, aspectModelUrn, name);
    this.properties = properties?.map(key => ({key, value: ''})) || [];
  }

  public addProperty(overWrittenProperty: OverWrittenProperty<any>, value: string | LangStringProperty | DefaultEntityValue = '') {
    this.properties.push({key: overWrittenProperty, value});
  }

  public removeProperty(property: DefaultProperty) {
    this.properties = this.properties.filter(({key}) => key.property.aspectModelUrn !== property.aspectModelUrn);
  }

  public addParent(element: DefaultEnumeration | DefaultEntityValue) {
    this.parents.push(element);
  }

  public removeParent(element: DefaultEnumeration | DefaultEntityValue) {
    this.parents = this.parents.filter(parent => parent.aspectModelUrn !== element.aspectModelUrn);
  }
}
