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
 * The root `package.json` sets "main" to "dist/main.js" so that running
 * `electron .` locally (see the `start:electron:*` scripts) finds the
 * compiled entry point produced by `tsc -p tsconfig.electron(.prod).json`.
 *
 * When electron-builder packages the app, it copies `dist/main.js` to the
 * package root as `main.js` and also copies a `package.json` from `dist/`
 * to the package root (see the `build.*.files` config in package.json).
 * That copied `package.json` must therefore point "main" to "main.js"
 * (relative to the package root), not "dist/main.js".
 *
 * This script generates that `dist/package.json` from the root
 * `package.json`, overriding only the "main" field, so both scenarios are
 * covered from a single source of truth without manual upkeep.
 */

const fs = require('fs');
const path = require('path');

const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
const distPackageJsonPath = path.join(__dirname, '..', 'dist', 'package.json');

const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
packageJson.main = 'main.js';

fs.mkdirSync(path.dirname(distPackageJsonPath), {recursive: true});
fs.writeFileSync(distPackageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Generated ${path.relative(process.cwd(), distPackageJsonPath)} with "main": "main.js"`);
