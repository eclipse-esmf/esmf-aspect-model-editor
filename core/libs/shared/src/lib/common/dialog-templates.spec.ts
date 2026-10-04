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

import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const LIBS_DIR = resolve(__dirname, '../../../../');

/** Progress dialogs without a way to cancel the running process; they close themselves. */
const WITHOUT_CLOSE_BUTTON = ['editor/src/lib/open-element-window/open-element-window.component.html'];

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

const dialogTemplates = htmlFiles(LIBS_DIR)
  .map(path => ({path: relative(LIBS_DIR, path), html: readFileSync(path, 'utf-8')}))
  .filter(({html}) => /mat-dialog-title|mat-dialog-content|<mat-dialog-actions/.test(html));

describe('dialog templates', () => {
  it('finds the dialog templates', () => {
    expect(dialogTemplates.length).toBeGreaterThan(20);
  });

  it.each(dialogTemplates.filter(({path}) => !WITHOUT_CLOSE_BUTTON.includes(path)).map(({path, html}) => [path, html]))(
    '%s uses the shared (x) button',
    (_path, html) => {
      expect(html).toContain('<ame-dialog-close-button');
    },
  );

  it.each(dialogTemplates.map(({path, html}) => [path, html]))('%s has no hand-made (x) button', (_path, html) => {
    expect(html).not.toMatch(/<button[^>]*class="close-button"/);
    expect(html).not.toMatch(/<button[^>]*mat-dialog-close[^>]*>\s*<mat-icon>close<\/mat-icon>/);
  });
});
