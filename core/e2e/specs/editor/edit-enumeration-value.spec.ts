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

test.describe('Test editing Value', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
  });

  test('can add new Value and choose it in Enumeration', async ({page}) => {
    await dragElementToGraph(page, SELECTOR_ecValue, 350, 300);
    await app.shapeExists('Value1', true);
    await app.clickShape('Value1');

    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="Enumeration"]').click();

    await page.locator(FIELD_values).click();
    await page.locator('mat-option').filter({hasText: 'Value1'}).first().click();
    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':Characteristic1 a samm-c:Enumeration');
    expect(rdf).toContain('samm-c:values (:Value1)');
    expect(rdf).toContain('Value1 a samm:Value');
  });

  test('can add Multiple Simple values and Multiple Value elements into values', async ({page}) => {
    await dragElementToGraph(page, SELECTOR_ecValue, 350, 300);
    await app.shapeExists('Value1', true);

    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="Enumeration"]').click();

    await page.locator(FIELD_values).click();
    await page.locator('mat-option').filter({hasText: 'Value1'}).first().click();

    await page.locator(FIELD_values).fill('a');
    await page.locator('mat-option').first().click();

    await page.locator(FIELD_values).fill('b');
    await page.locator('mat-option').first().click();

    await page.locator(FIELD_values).fill('Value2');
    await page.locator('mat-option').nth(1).click();

    await page.locator(FIELD_values).fill('Value3');
    await page.locator('mat-option').nth(1).click();

    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':Characteristic1 a samm-c:Enumeration');
    expect(rdf).toContain('samm-c:values (:Value1 "a" "b" :Value2 :Value3)');
    expect(rdf).toContain('Value1 a samm:Value');
    expect(rdf).toContain('Value2 a samm:Value');
    expect(rdf).toContain('Value3 a samm:Value');
  });

  test('can remove Value elements from values', async ({page}) => {
    await dragElementToGraph(page, SELECTOR_ecValue, 350, 300);
    await app.shapeExists('Value1', true);

    await app.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="Enumeration"]').click();

    await page.locator(FIELD_values).click();
    await page.locator('mat-option').filter({hasText: 'Value1'}).first().click();

    await page.locator(FIELD_values).fill('a');
    await page.locator('mat-option').first().click();

    // Remove all chips
    const chipIcons = page.locator(FIELD_chipIcon);
    const count = await chipIcons.count();
    for (let i = 0; i < count; i++) {
      await chipIcons.first().click();
    }

    await page.locator(FIELD_see).click();
    await expect(page.locator(FIELD_values).locator('xpath=ancestor::mat-form-field').locator('mat-error')).toBeVisible();

    // Add replacement value
    await page.locator(FIELD_values).fill('Value3');
    await page.locator('mat-option').nth(1).click();

    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':Characteristic1 a samm-c:Enumeration');
    expect(rdf).toContain('samm-c:values (:Value3)');
  });
});
