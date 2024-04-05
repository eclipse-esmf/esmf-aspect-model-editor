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
import {DefaultEntityInstance} from './default-entity-value';
import {BaseMetaModelElement} from './base';
import {DefaultEntity, Entity} from './default-entity';

export interface Enumeration extends Characteristic {
  values: Array<DefaultEntityInstance | string | number | boolean>;
}

export class DefaultEnumeration extends DefaultCharacteristic implements Enumeration {
  public newDataType: Entity;

  static createInstance() {
    return new DefaultEnumeration(null, null, 'Characteristic', []);
  }

  get className() {
    return 'DefaultEnumeration';
  }

  constructor(
    public metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public values: Array<DefaultEntityInstance | string | number | boolean>,
    dataType?: Type,
  ) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultEntity) {
      this.dataType = null;
      this.values = [];
    }
  }
}
