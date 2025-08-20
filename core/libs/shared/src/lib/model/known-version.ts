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

export enum SammVersion {
  SAMM_2_2_0 = '2.2.0',
}

export class KnownVersion {
  public static fromVersionString(version: string): SammVersion {
    if (SammVersion.SAMM_2_2_0 === version) {
      return SammVersion.SAMM_2_2_0;
    }

    return null;
  }
}
