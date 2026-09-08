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

// The electron main process code calls `alert()` in some error paths.
// Node's environment does not implement it, so provide a harmless stub for tests.
if (typeof (globalThis as any).alert !== 'function') {
  (globalThis as any).alert = () => {};
}
