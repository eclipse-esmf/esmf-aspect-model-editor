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

import {Base, BaseMetaModelElement} from './base';
import {HasProperties} from './has-properties';
import {Type} from './type';
import {OverWrittenProperty} from './overwritten-property';
import {AspectModelVisitor} from '@ame/mx-graph';
import {CanExtend} from './can-extend';
import {DefaultAbstractEntity} from './default-abstract-entity';

export interface Entity extends BaseMetaModelElement, HasProperties, Type, CanExtend {}

export class DefaultEntity extends Base implements Entity {
  public extendedElement: Entity;

  public get className() {
    return 'DefaultEntity';
  }

  public get ownProperties(): OverWrittenProperty[] {
    return this._properties;
  }

  public get properties() {
    if (this.extendedElement instanceof DefaultEntity || this.extendedElement instanceof DefaultAbstractEntity) {
      return [...this._properties, ...this.extendedElement.properties];
    }
    return this._properties;
  }

  public set properties(_properties: OverWrittenProperty[]) {
    this._properties = _properties;
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, private _properties: Array<OverWrittenProperty> = []) {
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
