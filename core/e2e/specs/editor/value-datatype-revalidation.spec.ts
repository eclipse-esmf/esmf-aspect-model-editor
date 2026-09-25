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
import {FIELD_value, SELECTOR_ecValue, SELECTOR_elementBtn} from '../../support/constants';
import {dragElementToGraph} from '../../support/drag-drop-utils';

test.describe('Test samm:Value DataType change triggers revalidation', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
  });

  test('changing dataType to integer revalidates string value and marks it invalid', async ({page}) => {
    await dragElementToGraph(page, SELECTOR_ecValue, 350, 300);
    await app.shapeExists('Value1', true);

    await app.dbClickShape('Value1');

    // Default dataType is string - enter text into value input
    const valueInput = page.locator(FIELD_value);
    await valueInput.fill('invalidNumberText');

    // Change dataType to integer
    const dataTypeSelect = page.locator('[data-testid="valueDataTypeSelect"]');
    await dataTypeSelect.click();
    await page.locator('mat-option').filter({hasText: 'integer'}).first().click();

    // Value input field should immediately revalidate and show error for non-integer text
    const valueFormField = valueInput.locator('xpath=ancestor::mat-form-field');
    await expect(valueFormField.locator('mat-error')).toBeVisible();
  });
});
