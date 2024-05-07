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
import {DefaultQuantifiable} from './default-quantifiable';
import {Type} from './type';
import {Unit} from './default-unit';

export class DefaultDuration extends DefaultQuantifiable {
  static createInstance() {
    return new DefaultDuration(null, null, 'Characteristic', null);
  }

  get className() {
    return 'DefaultDuration';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, dataType?: Type, public unit?: Unit) {
    super(metaModelVersion, aspectModelUrn, name, dataType);
  }
}
