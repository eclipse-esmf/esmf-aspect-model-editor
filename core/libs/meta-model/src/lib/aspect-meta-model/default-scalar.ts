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

export class DefaultScalar implements Type {
  get className() {
    return 'DefaultScalar';
  }

  constructor(private urn: string) {}

  getUrn(): string {
    return this.urn;
  }

  isComplex(): boolean {
    return false;
  }

  isScalar(): boolean {
    return true;
  }
}
