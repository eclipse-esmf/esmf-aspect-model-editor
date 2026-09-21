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
import {SELECTOR_settingsButton, SettingsDialogSelectors} from '../../support/constants';

test.describe('Settings - Auto Validation & Timers', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('should open editor settings and configure auto validate interval', async ({page}) => {
    await page.locator(SELECTOR_settingsButton).click({force: true});
    await expect(page.locator(SettingsDialogSelectors.autoValidateInput)).toBeVisible();

    await page.locator(SettingsDialogSelectors.autoValidateInput).fill('60');
    await page.locator(SettingsDialogSelectors.settingsDialogOkButton).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Verify saved state
    await page.locator(SELECTOR_settingsButton).click({force: true});
    await expect(page.locator(SettingsDialogSelectors.autoValidateInput)).toBeVisible();
    await expect(page.locator(SettingsDialogSelectors.autoValidateInput)).toHaveValue('60');
    await page.locator(SettingsDialogSelectors.settingsDialogOkButton).click();
  });
});
