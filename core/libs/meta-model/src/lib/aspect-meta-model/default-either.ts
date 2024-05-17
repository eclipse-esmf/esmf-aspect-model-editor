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
import {BaseMetaModelElement} from './base';

export interface Either extends Characteristic {
  left: Characteristic;
  right: Characteristic;
}

export class DefaultEither extends DefaultCharacteristic implements Either {
  static createInstance() {
    return new DefaultEither(null, null, 'Characteristic', null, null);
  }

  get className() {
    return 'DefaultEither';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public left: Characteristic,
    public right: Characteristic,
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.left?.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.left = null;
    } else if (this.right?.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.right = null;
    }
  }
}
