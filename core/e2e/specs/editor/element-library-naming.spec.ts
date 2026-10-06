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
import {FIELD_renameModelInput} from '../../support/constants';

test.describe('Element Library naming (model without an Aspect)', () => {
  test('no translation uses the old "Shared Model" wording any more', async ({request}) => {
    for (const lang of ['en', 'de', 'zh']) {
      const text = await (await request.get(`/assets/i18n/${lang}.json`)).text();
      expect(text, lang).not.toMatch(/shared ?model/i);
      expect(text, lang).not.toContain('共享');
    }
  });

  test('uses the neutral name in all languages', async ({request}) => {
    const expected = {en: 'Element Library', de: 'Elementbibliothek', zh: '元素库'};
    for (const [lang, name] of Object.entries(expected)) {
      const json = await (await request.get(`/assets/i18n/${lang}.json`)).json();
      expect(json.declareNameDialog.title, lang).toContain(name);
      expect(json.declareNameDialog.infoContent, lang).toContain(name);
      expect(json.confirmDialog.createAspect.aspectCreationWarning, lang).toContain(name);
    }
  });

  test('removing the Aspect asks for the name of the Element Library', async ({page}) => {
    const app = new AppHelper(page);
    await app.startModelling();
    await app.clickShape('AspectDefault');
    await page.keyboard.press('Delete');

    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[mat-dialog-title]')).toHaveText('Declare name of Element Library');
    await expect(dialog).toContainText('transform this Aspect Model into an Element Library (a model without an Aspect)');
    await expect(dialog).not.toContainText(/shared model/i);
    await expect(page.locator(FIELD_renameModelInput)).toBeVisible();

    await dialog.getByRole('button', {name: /cancel/i}).click();
    await expect(dialog).not.toBeVisible();
    await app.shapeExists('AspectDefault');
  });
});
