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

export class RdfHelper {
  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  static isString(value) {
    return typeof value === 'string' || (typeof value === 'object' && value.constructor === String);
  }

  static isNumber(value) {
    return typeof value === 'number' || (typeof value === 'object' && value.constructor === Number);
  }
}
