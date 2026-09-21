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

test.describe('Test language settings - Copyright Header', () => {
  let app: AppHelper;
  const copyrightField = '[data-cy="copyright"]';

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('can see copyright header', async ({page}) => {
    await page.locator(SELECTOR_settingsButton).click();
    await page
      .locator('.settings__node')
      .filter({hasText: /copyright/i})
      .first()
      .click();
    const input = page.locator(copyrightField);
    await expect(input).toBeVisible();
    await input.clear();
    await expect(input).toHaveValue('');
    await page.locator(SettingsDialogSelectors.settingsDialogCancelButton).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);
  });

  test('can add copyright header', async ({page}) => {
    await page.locator(SELECTOR_settingsButton).click();
    await page
      .locator('.settings__node')
      .filter({hasText: /copyright/i})
      .first()
      .click();
    const input = page.locator(copyrightField);
    await expect(input).toBeVisible();

    // Invalid format without '#' should disable OK and Apply buttons
    await input.fill('CopyrightHeader');
    await expect(page.locator(SettingsDialogSelectors.settingsDialogOkButton)).toBeDisabled();
    await expect(page.locator(SettingsDialogSelectors.settingsDialogApplyButton)).toBeDisabled();

    // Valid format with '#'
    await input.fill('# CopyrightHeader');
    await expect(page.locator(SettingsDialogSelectors.settingsDialogOkButton)).toBeEnabled();
    await page.locator(SettingsDialogSelectors.settingsDialogOkButton).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    // Reopen settings and verify persisted value
    await page.locator(SELECTOR_settingsButton).click();
    await page
      .locator('.settings__node')
      .filter({hasText: /copyright/i})
      .first()
      .click();
    await expect(page.locator(copyrightField)).toHaveValue('# CopyrightHeader');
    await page.locator(SettingsDialogSelectors.settingsDialogCancelButton).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);
  });
});
