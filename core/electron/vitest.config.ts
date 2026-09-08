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

import * as path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  root: path.resolve(__dirname, '..'),
  test: {
    name: 'electron',
    environment: 'node',
    globals: true,
    include: ['electron/**/*.spec.ts', 'main.spec.ts'],
    reporters: ['default'],
    setupFiles: ['electron/vitest-setup.ts'],
    watch: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage/electron',
    },
  },
});
