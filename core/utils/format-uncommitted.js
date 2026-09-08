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
 * Formats only the files that have uncommitted changes (staged + working tree),
 * instead of the whole repository. This mirrors nx's own `--uncommitted` semantics
 * (used by `lint:uncommitted`), but implemented via plain `git diff` since prettier's
 * `format` script is not an nx target and therefore cannot use `nx affected`.
 *
 * Runs from `core/` (this is invoked via the `format:uncommitted` npm script).
 */

const {execFileSync} = require('child_process');
const path = require('path');

const FORMATTED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.scss']);

function getRepoRoot() {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {encoding: 'utf-8'}).trim();
}

function getChangedFiles(repoRoot) {
  // Combines staged + unstaged changes against HEAD, matching what nx considers "uncommitted".
  const output = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf-8',
  });

  return output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function main() {
  const repoRoot = getRepoRoot();
  const coreDir = path.resolve(__dirname, '..');
  const coreRelativePrefix = path.relative(repoRoot, coreDir).split(path.sep).join('/');

  const changedFiles = getChangedFiles(repoRoot)
    .filter(file => file.startsWith(`${coreRelativePrefix}/`))
    .map(file => file.slice(coreRelativePrefix.length + 1))
    .filter(file => FORMATTED_EXTENSIONS.has(path.extname(file)))
    .filter(file => require('fs').existsSync(path.join(coreDir, file)));

  if (!changedFiles.length) {
    console.log('format:uncommitted - no changed files to format.');
    return;
  }

  console.log(`format:uncommitted - formatting ${changedFiles.length} file(s):\n${changedFiles.map(f => `  ${f}`).join('\n')}`);

  execFileSync('npx', ['prettier', '--config', './.prettierrc', '--write', ...changedFiles], {
    cwd: coreDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

main();
