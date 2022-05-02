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
import {DefaultUnit, Unit} from './default-unit';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {Type} from './type';
import {BaseMetaModelElement} from './base';
import {DefaultScalar} from './default-scalar';

export interface Quantifiable extends Characteristic {
  unit?: Unit;
}

export class DefaultQuantifiable extends DefaultCharacteristic implements Quantifiable {
  static createInstance() {
    return new DefaultQuantifiable(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultQuantifiable';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, dataType?: Type, public unit?: Unit) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.unit && baseMetalModelElement && this.unit.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.unit = null;
    }
    super.delete(baseMetalModelElement);
  }

  update(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultUnit) {
      this.unit = baseMetalModelElement;
    } else if (baseMetalModelElement instanceof DefaultScalar) {
      this.dataType = baseMetalModelElement;
    }
  }
}
