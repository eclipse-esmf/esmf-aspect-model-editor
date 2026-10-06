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
import {chmodSync, cpSync, existsSync, lstatSync, readdirSync, realpathSync, rmSync} from 'node:fs';
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

/** Directories below `dir` that contain `fileName`. */
function directoriesContaining(dir, fileName) {
  const entries = readdirSync(dir, {withFileTypes: true});
  const found = entries.some(entry => entry.name === fileName) ? [dir] : [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      found.push(...directoriesContaining(join(dir, entry.name), fileName));
    }
  }
  return found;
}

function linuxBuildEnv() {
  // The JDK libraries of the backend link against libjvm.so, which Java loads from lib/server by its full path.
  // linuxdeploy (AppImage) checks the dependencies of every library and fails if it cannot find libjvm.so.
  const libraryPath = [...directoriesContaining(backendDir, 'libjvm.so'), process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');
  return {
    ...process.env,
    // linuxdeploy ships an old `strip` which fails on libraries of current distributions
    NO_STRIP: 'true',
    LD_LIBRARY_PATH: libraryPath,
  };
}

const env = os === 'linux' ? linuxBuildEnv() : process.env;

/**
 * Tauri copies the backend into the app bundle and resolves symbolic links (e.g. the license files of the JDK)
 * on the way, which breaks the code signature of the backend. macOS then reports the downloaded app as "damaged".
 * Replace the links by real files and sign the backend again (ad-hoc, no certificate needed).
 */
function prepareMacBackend(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      const target = realpathSync(path);
      rmSync(path);
      cpSync(target, path, {recursive: true, dereference: true});
    } else if (entry.isDirectory()) {
      prepareMacBackend(path);
    }
  }
}

if (os === 'macos') {
  prepareMacBackend(backendDir);
  for (const app of readdirSync(backendDir).filter(name => name.endsWith('.app'))) {
    const signing = spawnSync('codesign', ['--force', '--deep', '--sign', '-', join(backendDir, app)], {stdio: 'inherit'});
    if (signing.status !== 0) {
      console.error(`Unable to sign the backend ${app}.`);
      process.exit(1);
    }
  }
}

const tauriCli = createRequire(import.meta.url).resolve('@tauri-apps/cli/tauri.js');
const result = spawnSync(process.execPath, [tauriCli, 'build', '--config', backendConfig, ...args], {cwd: coreDir, stdio: 'inherit', env});

process.exit(result.status ?? 1);
