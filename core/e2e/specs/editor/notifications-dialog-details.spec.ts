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
import {
  SELECTOR_notificationsBtn,
  SELECTOR_notificationsClearButton,
  SELECTOR_notificationsDialogCloseButton,
} from '../../support/constants';

test.describe('Notifications Dialog - Details & Actions', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('can open notifications dialog and view table', async ({page}) => {
    const notifBtn = page.locator(SELECTOR_notificationsBtn);
    await expect(notifBtn).toBeVisible();
    await notifBtn.click();

    // Verify dialog opens
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();

    // Verify clear button and close button are present
    await expect(page.locator(SELECTOR_notificationsClearButton)).toBeVisible();
    await expect(page.locator(SELECTOR_notificationsDialogCloseButton)).toBeVisible();

    // Close dialog
    await page.locator(SELECTOR_notificationsDialogCloseButton).click();
    await expect(dialog).not.toBeVisible();
  });
});
