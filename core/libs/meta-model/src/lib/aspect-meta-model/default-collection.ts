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
import {Type} from './type';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {BaseMetaModelElement} from './base';
import {DefaultEntity} from './default-entity';

export interface Collection extends Characteristic {
  elementCharacteristic?: Characteristic;
}

export class DefaultCollection extends DefaultCharacteristic implements Collection {
  static createInstance() {
    return new DefaultCollection(null, null, 'Characteristic');
  }

  get className() {
    return 'DefaultCollection';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public elementCharacteristic?: Characteristic,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultEntity) {
      this.dataType = null;
    } else if (this.elementCharacteristic && this.elementCharacteristic.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.elementCharacteristic = null;
    }
  }

  update(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultCharacteristic) {
      this.elementCharacteristic = baseMetalModelElement;
    }
  }
}
