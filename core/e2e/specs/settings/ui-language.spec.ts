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
import {SettingsDialogSelectors} from '../../support/constants';

type TranslationTree = {[key: string]: string | TranslationTree};

function flatten(tree: TranslationTree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) return {...acc, ...flatten(value, `${prefix}${key}.`)};
    acc[`${prefix}${key}`] = value;
    return acc;
  }, {});
}

function placeholders(text: string): string[] {
  return (text.match(/\{\{\s*\w+\s*\}\}/g) || []).map(p => p.replace(/\s/g, '')).sort();
}

test.describe('UI language German (de.json)', () => {
  test('de.json contains every key and placeholder of en.json', async ({request}) => {
    const en = flatten(await (await request.get('/assets/i18n/en.json')).json());
    const de = flatten(await (await request.get('/assets/i18n/de.json')).json());

    expect(Object.keys(en).filter(key => !(key in de))).toEqual([]);
    expect(Object.keys(de).filter(key => !(key in en))).toEqual([]);
    expect(Object.keys(en).filter(key => JSON.stringify(placeholders(en[key])) !== JSON.stringify(placeholders(de[key])))).toEqual([]);
    expect(Object.keys(de).filter(key => !String(de[key]).trim())).toEqual([]);
  });

  test('offers German in the user interface language selection', async ({page}) => {
    const app = new AppHelper(page);
    await app.startModelling();
    await app.openSettings(/language|sprache/i);

    await page.locator('.language-selection mat-select').click();
    await expect(page.locator('mat-option').filter({hasText: 'German'})).toBeVisible();
    await expect(page.locator('mat-option').filter({hasText: 'English'})).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('switches the UI to German and persists the choice', async ({page}) => {
    const app = new AppHelper(page);
    await app.startModelling();
    await app.openSettings(/language|sprache/i);

    await page.locator('.language-selection mat-select').click();
    await page.locator('mat-option').filter({hasText: 'German'}).click();
    await page.locator(SettingsDialogSelectors.settingsDialogOkButton).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);

    expect(await page.evaluate(() => localStorage.getItem('applicationLanguage'))).toBe('de');

    await app.openSettings();
    await expect(page.locator('mat-dialog-container')).toContainText('Einstellungen');
    await expect(page.locator('.settings__node').filter({hasText: 'Sprachen'}).first()).toBeVisible();

    // Switch back so that the language choice does not leak into other tests of the same context.
    await page.locator('.settings__node').filter({hasText: 'Sprachen'}).first().click();
    await page.locator('.language-selection mat-select').click();
    await page.locator('mat-option').filter({hasText: 'Englisch'}).click();
    await page.locator(SettingsDialogSelectors.settingsDialogOkButton).click();
    await expect(page.locator('mat-dialog-container')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('applicationLanguage'))).toBe('en');
  });

  test('starts in German when German was selected before', async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('applicationLanguage', 'de'));
    const app = new AppHelper(page);
    await app.startModelling();

    await app.openSettings();
    await expect(page.locator('mat-dialog-container')).toContainText('Einstellungen');
    await expect(page.locator('.settings__node').filter({hasText: 'Sprachen'}).first()).toBeVisible();
  });
});
