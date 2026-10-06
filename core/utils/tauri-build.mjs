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

// Runs `tauri build` with the bundled backend of the target platform.
//
// The backend is only added as bundle resource here (src-tauri/tauri.bundle-backend.<os>.conf.json) and not in
// tauri.<os>.conf.json, because Tauri copies all resources on every build. `tauri dev` does not use the bundled
// backend and must work without the backend folder.
//
// Usage: node utils/tauri-build.mjs [any tauri build argument, e.g. --target x86_64-pc-windows-msvc]

import {spawnSync} from 'node:child_process';
import {chmodSync, existsSync, lstatSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const coreDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tauriDir = join(coreDir, 'src-tauri');
const args = process.argv.slice(2);

function targetPlatform() {
  const targetIndex = args.findIndex(arg => arg === '--target' || arg === '-t');
  const target = targetIndex >= 0 ? args[targetIndex + 1] : args.find(arg => arg.startsWith('--target='))?.split('=')[1];
  const platform = target ?? process.platform;

  if (/darwin/.test(platform)) return 'macos';
  if (/windows|win32/.test(platform)) return 'windows';
  if (/linux/.test(platform)) return 'linux';
  throw new Error(`Unsupported platform: ${platform}`);
}

/** jpackage ships read-only JDK files; copies of them cannot be overwritten by the next build. */
function makeWritable(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink()) {
    return;
  }
  if ((stats.mode & 0o200) === 0) {
    chmodSync(path, stats.mode | 0o200);
  }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      makeWritable(join(path, entry));
    }
  }
}

function previousBackendCopies(os) {
  const targetDir = join(tauriDir, 'target');
  if (!existsSync(targetDir)) {
    return [];
  }
  const profileDirs = ['debug', 'release'].map(profile => join(targetDir, profile));
  for (const entry of readdirSync(targetDir)) {
    profileDirs.push(join(targetDir, entry, 'debug'), join(targetDir, entry, 'release'));
  }
  return profileDirs.map(dir => join(dir, 'backend', os)).filter(dir => existsSync(dir));
}

const os = targetPlatform();
const backendDir = resolve(coreDir, '..', 'backend', os);
const backendConfig = join(tauriDir, `tauri.bundle-backend.${os}.conf.json`);

if (!existsSync(backendDir) || readdirSync(backendDir).length === 0) {
  console.error(
    `The backend for ${os} is missing in ${backendDir}.\n` +
      'Extract the jpackage app image of the backend release there (see README, "Backend for the desktop app").',
  );
  process.exit(1);
}

if (process.platform !== 'win32') {
  for (const dir of [backendDir, ...previousBackendCopies(os)]) {
    makeWritable(dir);
  }
}

// linuxdeploy (AppImage) ships an old `strip` which fails on libraries of current distributions
const env = os === 'linux' ? {...process.env, NO_STRIP: 'true'} : process.env;

const tauriCli = createRequire(import.meta.url).resolve('@tauri-apps/cli/tauri.js');
const result = spawnSync(process.execPath, [tauriCli, 'build', '--config', backendConfig, ...args], {cwd: coreDir, stdio: 'inherit', env});

process.exit(result.status ?? 1);
