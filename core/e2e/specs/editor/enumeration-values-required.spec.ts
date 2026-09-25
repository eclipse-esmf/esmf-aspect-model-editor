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
  FIELD_characteristicName,
  FIELD_chipIcon,
  FIELD_see,
  FIELD_values,
  SELECTOR_ecValue,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {dragElementToGraph} from '../../support/drag-drop-utils';

test.describe('Enumeration & State values required field validation', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
  });

  test('values field displays required asterisk for Enumeration', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Enumeration"]').click();

    const valuesFormField = page.locator(FIELD_values).locator('xpath=ancestor::mat-form-field');
    await expect(valuesFormField.locator('.mat-mdc-form-field-required-marker')).toBeVisible();
  });

  test('values field displays required asterisk for State', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="State"]').click();

    const valuesFormField = page.locator(FIELD_values).locator('xpath=ancestor::mat-form-field');
    await expect(valuesFormField.locator('.mat-mdc-form-field-required-marker')).toBeVisible();
  });

  test('shows error when values field is empty in Enumeration', async ({page}) => {
    await dragElementToGraph(page, SELECTOR_ecValue, 350, 300);
    await app.shapeExists('Value1', true);

    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Enumeration"]').click();

    await page.locator(FIELD_values).click();
    await page.locator('mat-option').filter({hasText: 'Value1'}).first().click();

    // Remove the selected chip
    const chipIcons = page.locator(FIELD_chipIcon);
    await chipIcons.first().click();

    // Trigger blur / validation
    await page.locator(FIELD_see).click();

    const valuesFormField = page.locator(FIELD_values).locator('xpath=ancestor::mat-form-field');
    await expect(valuesFormField.locator('mat-error')).toBeVisible();
  });
});
