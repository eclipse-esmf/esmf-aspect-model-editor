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
import {Entity} from './default-entity';
import {OverWrittenProperty} from './overwritten-property';

export class DefaultAbstractEntity extends Base implements Entity {
  public extendedElement: DefaultAbstractEntity;

  public get className(): string {
    return 'DefaultAbstractEntity';
  }

  public get ownProperties(): OverWrittenProperty[] {
    return this.properties;
  }

  public get extendedProperties(): OverWrittenProperty[] {
    if (this.extendedElement instanceof DefaultAbstractEntity) {
      return this.extendedElement.properties;
    }

    return [];
  }

  public get allProperties(): OverWrittenProperty[] {
    return [...(this.extendedProperties || []), ...this.properties];
  }

  public get extendedPreferredName() {
    if (!this.extendedElement) {
      return null;
    }

    return this.extendedElement.preferredNames.size ? this.extendedElement.preferredNames : this.extendedElement.extendedPreferredName;
  }

  public get extendedDescription() {
    if (!this.extendedElement) {
      return null;
    }

    return this.extendedElement.descriptions.size ? this.extendedElement.descriptions : this.extendedElement.extendedDescription;
  }

  public get extendedSee() {
    if (!this.extendedElement) {
      return null;
    }

    return this.extendedElement.see?.length ? this.extendedElement.see : this.extendedElement.extendedSee;
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public properties: OverWrittenProperty[] = []) {
    super(metaModelVersion, aspectModelUrn, name);
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
