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
import {SELECTOR_alertRightButton, SettingsDialogSelectors} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

function assertNullMultiLanguageValues(modelElement: any, langTag: string) {
  const descriptions = modelElement.descriptions || {};
  const preferredNames = modelElement.preferredNames || {};
  const lowerTag = langTag.toLowerCase();
  expect(descriptions[langTag] || descriptions[lowerTag] || null).toBeNull();
  expect(preferredNames[langTag] || preferredNames[lowerTag] || null).toBeNull();
}

function assertNotNullMultiLanguageValues(modelElement: any, langTag: string) {
  const descriptions = modelElement.descriptions || {};
  const preferredNames = modelElement.preferredNames || {};
  expect(descriptions[langTag] || modelElement.description).toBeTruthy();
  expect(preferredNames[langTag] || modelElement.preferredName).toBeTruthy();
}

test.describe('Test language settings', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('can open settings dialog', async ({page}) => {
    await app.openSettings(/language|sprache/i);
    await expect(page.locator('[data-testid="langCode"]')).toHaveValue('English (en)');
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
  });

  test('can add new language', async ({page}) => {
    await app.openSettings(/language|sprache/i);
    await expect(page.locator('[data-testid="langCode"]')).toHaveValue('English (en)');
    await page.locator('[data-testid="addLang"]').click({force: true});
    const lastInput = page.locator('[data-testid="langCode"]').last();
    await lastInput.click();
    await lastInput.pressSequentially('German', {delay: 50});
    const option = page.locator('mat-option').filter({hasText: 'German (de)'}).first();
    await option.waitFor({state: 'visible'});
    await option.click();
    await page.locator(SettingsDialogSelectors.settingsDialogApplyButton).click({force: true});
    await expect(lastInput).toHaveValue('German (de)');
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
  });

  test('can delete language', async ({page}) => {
    await app.openSettings(/language|sprache/i);
    await page.locator('[data-testid="addLang"]').click({force: true});
    const lastInput = page.locator('[data-testid="langCode"]').last();
    await lastInput.click();
    await lastInput.pressSequentially('German', {delay: 50});
    const option = page.locator('mat-option').filter({hasText: 'German (de)'}).first();
    await option.waitFor({state: 'visible'});
    await option.click();
    await page.locator(SettingsDialogSelectors.settingsDialogApplyButton).click({force: true});

    await page.locator('.delete-icon').last().click({force: true});
    await page.locator(SettingsDialogSelectors.settingsDialogApplyButton).click({force: true});

    const alertCancelBtn = page.locator('[data-testid="alert-left-btn"]');
    if (await alertCancelBtn.isVisible().catch(() => false)) {
      await alertCancelBtn.click({force: true});
    }

    await expect(page.locator('[data-testid="langCode"]').last()).toHaveValue('English (en)');
    await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);
  });

  test('can delete and remove all multi language information in the loaded model', async ({page}) => {
    const rdfString = readFixture('multi-language-model.txt');
    await app.loadModel(rdfString);

    await app.openSettings(/language|sprache/i);
    await expect(page.locator('[data-testid="langCode"]')).toHaveCount(3);

    await page.locator('.delete-icon').last().click({force: true});
    await expect(page.locator('[data-testid="langCode"]')).toHaveCount(2);
    await page.locator('.delete-icon').last().click({force: true});
    await expect(page.locator('[data-testid="langCode"]')).toHaveCount(1);
    await page.locator(SettingsDialogSelectors.settingsDialogOkButton).click({force: true});
    await page.locator(SELECTOR_alertRightButton).click({force: true});

    await app.closeDialog();
    const rdf = await app.getUpdatedRDF();
    expect(rdf).not.toContain('@en-us');
    expect(rdf).not.toContain('@de-de');
    expect(rdf).toContain('@en');

    const aspect = await app.getAspect();
    assertNotNullMultiLanguageValues(aspect, 'en');
    assertNullMultiLanguageValues(aspect, 'en-US');
    assertNullMultiLanguageValues(aspect, 'de-DE');
    assertNotNullMultiLanguageValues(aspect.properties[0], 'en');
    assertNullMultiLanguageValues(aspect.properties[0], 'en-US');
    assertNullMultiLanguageValues(aspect.properties[0], 'de-DE');
    assertNotNullMultiLanguageValues(aspect.properties[0].characteristic, 'en');
    assertNullMultiLanguageValues(aspect.properties[0].characteristic, 'en-US');
    assertNullMultiLanguageValues(aspect.properties[0].characteristic, 'de-DE');
  });
});
