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
import {DefaultCollection} from './default-collection';
import {Characteristic} from './default-characteristic';
import {Type} from './type';

export class DefaultList extends DefaultCollection {
  static createInstance() {
    return new DefaultList(null, null, 'Characteristic', null, null);
  }

  get className() {
    return 'DefaultList';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public elementCharacteristic?: Characteristic,
    dataType?: Type
  ) {
    super(metaModelVersion, aspectModelUrn, name, elementCharacteristic, dataType);
  }
}
