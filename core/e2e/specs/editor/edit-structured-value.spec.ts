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

test.describe('Test StructuredValue Characteristic & Deconstruction Rules', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
  });

  test('can choose StructuredValue and select predefined deconstruction rule', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="StructuredValue"]').click();

    // Select predefined rule
    const ruleSelect = page.locator('[data-testid="deconstruction-rule-select"]');
    await expect(ruleSelect).toBeVisible();
    await ruleSelect.click();

    // Pick "Email Address" rule
    const emailOption = page.locator('mat-option').filter({hasText: 'Email Address'}).first();
    await expect(emailOption).toBeVisible();
    await emailOption.click();

    // Input should be populated with the rule regex
    const ruleInput = page.locator('input[data-cy="deconstruction-rule-input"]');
    await expect(ruleInput).toHaveValue('([\\w\\.-]+)@([\\w\\.-]+\\.\\w{2,4})');

    // Button to open elements table should be visible
    const elementsBtn = page.locator('[data-testid="elements-modal-button"]');
    await expect(elementsBtn).toBeVisible();
  });

  test('shows validation error when custom regex is invalid', async ({page}) => {
    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="StructuredValue"]').click();

    // Switch to custom rule
    const ruleSelect = page.locator('[data-testid="deconstruction-rule-select"]');
    await ruleSelect.click();
    await page.locator('mat-option[value="--custom-rule--"]').click();

    // Fill invalid regex (unmatched parenthesis)
    const ruleInput = page.locator('input[data-cy="deconstruction-rule-input"]');
    await ruleInput.fill('([a-z+');
    await ruleInput.blur();

    const ruleFormField = ruleInput.locator('xpath=ancestor::mat-form-field');
    await expect(ruleFormField.locator('mat-error')).toBeVisible();
  });
});
