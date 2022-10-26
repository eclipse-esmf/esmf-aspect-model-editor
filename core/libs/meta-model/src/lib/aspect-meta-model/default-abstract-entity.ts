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
import {DefaultProperty} from './default-property';
import {DefaultAbstractProperty} from './default-abstract-property';
import {BaseMetaModelElement} from './base';
import {CanExtendsWithProperties} from './can-extend';
import {Entity} from './default-entity';
import {OverWrittenProperty} from './overwritten-property';

export class DefaultAbstractEntity extends CanExtendsWithProperties implements Entity {
  public extendedElement: DefaultAbstractEntity;
  public readonly predefined: boolean;

  public get className(): string {
    return 'DefaultAbstractEntity';
  }

  public get ownProperties(): OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>[] {
    return this.properties;
  }

  public get allProperties(): OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>[] {
    return [...(this.extendedProperties || []), ...this.properties];
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public properties: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>[] = [],
    predefined: boolean = false
  ) {
    super(metaModelVersion, aspectModelUrn, name);
    this.predefined = predefined;
  }

  static createInstance() {
    return new DefaultAbstractEntity(null, null, 'AbstractEntity', []);
  }

  getUrn(): string {
    return this.aspectModelUrn;
  }

  isScalar(): boolean {
    return false;
  }

  isComplex(): boolean {
    return false;
  }

  isPredefined() {
    return this.predefined;
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitAbstractEntity(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement.className === 'DefaultProperty' || baseMetalModelElement.className === 'DefaultAbstractProperty') {
      const index = this.properties.findIndex(({property}) => property.aspectModelUrn === baseMetalModelElement.aspectModelUrn);
      if (index >= 0) {
        this.properties.splice(index, 1);
      }
    }

    if ('DefaultAbstractEntity' === baseMetalModelElement.className) {
      this.extendedElement = null;
    }
  }
}
