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

import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {Type} from './type';
import {OverWrittenProperty} from './overwritten-property';
import {BaseMetaModelElement} from '@ame/meta-model';
import {DefaultProperty} from './default-property';

export interface StructuredValue extends Characteristic {
  deconstructionRule: string;
  elements: Array<string | OverWrittenProperty>;
}

export class DefaultStructuredValue extends DefaultCharacteristic implements StructuredValue {
  get className() {
    return 'DefaultStructuredValue';
  }

  static createInstance() {
    return new DefaultStructuredValue(null, null, 'Characteristic', null, []);
  }

  delete(modeElement: BaseMetaModelElement | Type) {
    super.delete(modeElement);

    if (modeElement instanceof DefaultProperty) {
      this.elements = this.elements?.filter(element => {
        if (typeof element === 'string') {
          return true;
        }

        if (element.property.aspectModelUrn === modeElement.aspectModelUrn) {
          return false;
        }

        return true;
      });
    }
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public deconstructionRule: string,
    public elements: Array<string | OverWrittenProperty>,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }
}
