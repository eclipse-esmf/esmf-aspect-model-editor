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

import {Base, BaseMetaModelElement} from './base';

export interface QuantityKind extends BaseMetaModelElement {
  label: string;
}

export class DefaultQuantityKind extends Base implements QuantityKind {
  get className() {
    return 'DefaultQuantityKind';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public label: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
