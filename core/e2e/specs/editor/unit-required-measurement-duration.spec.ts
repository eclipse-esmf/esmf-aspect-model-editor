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
import {FIELD_characteristicName, SELECTOR_elementBtn} from '../../support/constants';

test.describe('Unit field required validation for Measurement & Duration', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
  });

  test('unit field displays required asterisk for Measurement', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Measurement"]').click();

    const unitFormField = page.locator('input[data-testid="unit"]').locator('xpath=ancestor::mat-form-field');
    await expect(unitFormField.locator('.mat-mdc-form-field-required-marker')).toBeVisible();
  });

  test('unit field displays required asterisk for Duration', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Duration"]').click();

    const unitFormField = page.locator('input[data-testid="unit"]').locator('xpath=ancestor::mat-form-field');
    await expect(unitFormField.locator('.mat-mdc-form-field-required-marker')).toBeVisible();
  });

  test('unit field is optional for generic Quantifiable', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Quantifiable"]').click();

    const unitFormField = page.locator('input[data-testid="unit"]').locator('xpath=ancestor::mat-form-field');
    await expect(unitFormField.locator('.mat-mdc-form-field-required-marker')).not.toBeVisible();
  });
});
