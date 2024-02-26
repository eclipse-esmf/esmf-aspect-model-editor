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
import {BaseMetaModelElement} from './base';
import {HasProperties} from './has-properties';
import {Type} from './type';
import {OverWrittenProperty} from './overwritten-property';
import {CanExtendsWithProperties} from './can-extend';
import {DefaultAbstractEntity} from './default-abstract-entity';
import {DefaultProperty} from './default-property';
import {DefaultAbstractProperty} from './default-abstract-property';

export interface Entity extends BaseMetaModelElement, HasProperties, Type {}

export class DefaultEntity extends CanExtendsWithProperties implements Entity {
  public extendedElement: DefaultAbstractEntity | DefaultEntity = null;

  public get className() {
    return 'DefaultEntity';
  }

  public get allProperties(): OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>[] {
    return [...(this.extendedProperties || []), ...this.properties];
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public properties: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>[] = [],
    predefined = false,
  ) {
    super(metaModelVersion, aspectModelUrn, name);
    this.predefined = predefined;
  }

  public static createInstance(): DefaultEntity {
    return new DefaultEntity(null, null, 'Entity', []);
  }

  isComplex(): boolean {
    return true;
  }

  isScalar(): boolean {
    return false;
  }

  getUrn(): string {
    return this.aspectModelUrn;
  }

  isPredefined() {
    return this.predefined;
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement.className === 'DefaultProperty') {
      const index = this.properties.findIndex(({property}) => property.aspectModelUrn === baseMetalModelElement.aspectModelUrn);
      if (index >= 0) {
        this.properties.splice(index, 1);
      }
    }
    if (['DefaultAbstractEntity', 'DefaultEntity'].includes(baseMetalModelElement.className)) {
      this.extendedElement = null;
    }
  }
}
