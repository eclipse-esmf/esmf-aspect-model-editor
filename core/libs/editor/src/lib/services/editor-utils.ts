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

export class EditorUtils {
  static convertArraysToArray(inputArray: any): any[] {
    const resultArray = [];

    for (const pair of inputArray) {
      if (Array.isArray(pair) && pair.length === 2) {
        const [name, value] = pair;
        resultArray.push({name, value});
      }
    }
    return resultArray;
  }
}
