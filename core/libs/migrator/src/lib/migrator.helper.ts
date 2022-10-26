/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
export class ExporterHelper {
  public static isVersionOutdated(fileVersion: string, currentBammVersion: string) {
    const [b1, b2, b3] = currentBammVersion.split('.').map(x => Number(x));
    const [f1, f2, f3] = fileVersion.split('.').map(x => Number(x));

    if (b1 > f1) {
      return true;
    }

    if (b2 > f2) {
      return true;
    }

    if (b3 > f3) {
      return true;
    }

    return false;
  }
}
