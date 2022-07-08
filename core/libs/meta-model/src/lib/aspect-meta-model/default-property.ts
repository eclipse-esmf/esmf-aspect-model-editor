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

import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {BaseMetaModelElement} from './base';
import {LookUpDatatype} from './look-up-datatype';
import {Type} from './type';
import {DefaultScalar} from './default-scalar';
import {DefaultTrait} from './default-trait';
import {AspectModelVisitor} from '@ame/mx-graph';
import {DefaultAbstractProperty} from './default-abstract-property';
import {CanExtend} from './can-extend';

export interface Property extends BaseMetaModelElement, LookUpDatatype {
  characteristic: Characteristic;
  exampleValue?: any;
}

export class DefaultProperty extends CanExtend implements Property {
  public extendedElement: DefaultProperty | DefaultAbstractProperty;

  static createInstance() {
    return new DefaultProperty(null, null, 'property', null);
  }

  get className() {
    return 'DefaultProperty';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public characteristic: Characteristic,
    public exampleValue?: any
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  getDeepLookUpDataType(): Type {
    if (this.characteristic instanceof DefaultTrait) {
      return this.characteristic?.baseCharacteristic?.dataType;
    }
    return this.characteristic ? this.characteristic.dataType : null;
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitProperty(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.characteristic && this.characteristic.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.characteristic = null;
    }
  }

  update(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultCharacteristic) {
      this.characteristic = baseMetalModelElement;
    } else if (baseMetalModelElement instanceof DefaultScalar) {
      this.characteristic.dataType = baseMetalModelElement;
    }
  }
}
