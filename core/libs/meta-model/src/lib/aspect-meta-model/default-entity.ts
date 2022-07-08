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

import {BaseMetaModelElement} from './base';
import {HasProperties} from './has-properties';
import {Type} from './type';
import {OverWrittenProperty} from './overwritten-property';
import {AspectModelVisitor} from '@ame/mx-graph';
import {CanExtendsWithProperties} from './can-extend';
import {DefaultAbstractEntity} from './default-abstract-entity';

export interface Entity extends BaseMetaModelElement, HasProperties, Type {}

export class DefaultEntity extends CanExtendsWithProperties implements Entity {
  public extendedElement: DefaultAbstractEntity | DefaultEntity;

  public get className() {
    return 'DefaultEntity';
  }

  public get allProperties(): OverWrittenProperty[] {
    return [...(this.extendedProperties || []), ...this.properties];
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public properties: OverWrittenProperty[] = []) {
    super(metaModelVersion, aspectModelUrn, name);
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

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitEntity(this, context);
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
