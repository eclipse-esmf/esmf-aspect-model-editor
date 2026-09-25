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
import {SELECTOR_fileMenuCopyToClipboardButton, SELECTOR_openFileMenu, SELECTOR_workspaceBtn} from '../../support/constants';

test.describe('Workspace - Copy File Path to Clipboard', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('can copy file path from file actions context menu', async ({page}) => {
    const wsBtn = page.locator(SELECTOR_workspaceBtn);
    if (await wsBtn.isVisible()) {
      await wsBtn.click();

      const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
      await expect(fileMenuBtn).toBeVisible({timeout: 10000});
      await fileMenuBtn.click();

      const copyBtn = page.locator(SELECTOR_fileMenuCopyToClipboardButton);
      await expect(copyBtn).toBeVisible();
      await copyBtn.click();

      // Notification toast or snackbar confirms path copied
      const toast = page.locator('ame-alert, .mat-mdc-snack-bar-container, .notification').first();
      await expect(toast).toBeVisible({timeout: 5000});
    }
  });
});
