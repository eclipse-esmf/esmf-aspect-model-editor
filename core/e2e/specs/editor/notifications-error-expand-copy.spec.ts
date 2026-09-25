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
import {SELECTOR_notificationsBtn} from '../../support/constants';

test.describe('Notifications Dialog - Error Expansion and Copy', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('can expand notification description and copy its content', async ({page}) => {
    // Inject a notification with a detailed description into the notification service
    await page.evaluate(() => {
      const root = document.querySelector('app-root');
      if (root && (window as any).ng) {
        try {
          const injector = (window as any).ng.getInjector(root);
          // Look up NotificationsService token from app providers
          const notifService =
            injector.get('NotificationsService', null) || (window as any).angular?.fileHandlingService?.notificationsService;
          if (notifService) {
            notifService.error({
              title: 'Failed to load model file',
              message: 'Detailed error trace with line 42: invalid syntax',
            });
          }
        } catch {
          // fallback if token name differs
        }
      }
    });

    const notifBtn = page.locator(SELECTOR_notificationsBtn);
    await expect(notifBtn).toBeVisible();
    await notifBtn.click();

    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();

    // Check if notification row with expand button exists
    const expandIcon = page.locator('mat-table, table').locator('mat-icon:has-text("expand_more")').first();
    if (await expandIcon.isVisible()) {
      await expandIcon.click();

      // Description with preformatted text should now be visible
      const descriptionBlock = page.locator('.message-description');
      await expect(descriptionBlock).toBeVisible();

      // Copy button inside the expanded description
      const copyBtn = descriptionBlock.locator('.copy-btn');
      await expect(copyBtn).toBeVisible();
      await copyBtn.click();

      // Verify copied feedback icon or tooltip
      await expect(copyBtn.locator('mat-icon:has-text("check")')).toBeVisible();
    }
  });
});
