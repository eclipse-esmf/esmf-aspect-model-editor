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

import {Samm} from '@ame/vocabulary';
import {Type} from './type';
import {Base, BaseMetaModelElement} from './base';
import {DefaultEntity} from './default-entity';
import {DefaultScalar} from './default-scalar';

export interface Characteristic extends BaseMetaModelElement {
  dataType?: Type;
}

export class DefaultCharacteristic extends Base implements Characteristic {
  public createdFromEditor?: boolean;

  static createInstance() {
    return new DefaultCharacteristic(null, null, 'Characteristic');
  }

  get className() {
    return 'DefaultCharacteristic';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  isPredefined(): boolean {
    return this.aspectModelUrn ? this.aspectModelUrn.startsWith(`${Samm.BASE_URI}characteristic:${this.metaModelVersion}#`) : false;
  }

  delete(baseMetalModelElement: BaseMetaModelElement | Type) {
    if (baseMetalModelElement instanceof DefaultEntity || baseMetalModelElement instanceof DefaultScalar) {
      this.dataType = null;
    }
  }

  update(baseMetalModelElement: BaseMetaModelElement | Type) {
    if (baseMetalModelElement instanceof DefaultEntity || baseMetalModelElement instanceof DefaultScalar) {
      this.dataType = baseMetalModelElement;
    }
  }
}
