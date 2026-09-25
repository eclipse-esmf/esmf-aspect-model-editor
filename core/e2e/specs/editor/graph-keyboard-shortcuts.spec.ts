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

import {expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Graph Keyboard Shortcuts', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await app.loadModel(defaultRdf);
  });

  test('pressing Delete key deletes the selected element cell', async ({page}) => {
    await app.shapeExists('Characteristic1', true);

    // Select the cell
    await app.clickShape('Characteristic1');

    // Press Delete key
    await page.keyboard.press('Delete');

    // Cell should be removed from canvas
    await app.shapeExists('Characteristic1', false);
  });

  test('pressing Escape key dismisses the edit dialog', async ({page}) => {
    await app.shapeExists('AspectDefault', true);

    // Open edit dialog
    await app.dbClickShape('AspectDefault');

    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
