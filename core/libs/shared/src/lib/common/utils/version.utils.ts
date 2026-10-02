/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

/**
 * Checks if a semantic version is older than current SAMM version.
 *
 * @param fileVersion - Version of the file/model
 * @param currentSammVersion - Current target SAMM version
 */
export const isVersionOutdated = (fileVersion?: string, currentSammVersion?: string): boolean => {
  if (!fileVersion || !currentSammVersion) {
    return false;
  }
  const [b1 = 0, b2 = 0, b3 = 0] = currentSammVersion.split('.').map(x => Number(x) || 0);
  const [f1 = 0, f2 = 0, f3 = 0] = fileVersion.split('.').map(x => Number(x) || 0);

  if (b1 !== f1) {
    return b1 > f1;
  }
  if (b2 !== f2) {
    return b2 > f2;
  }
  return b3 > f3;
};
