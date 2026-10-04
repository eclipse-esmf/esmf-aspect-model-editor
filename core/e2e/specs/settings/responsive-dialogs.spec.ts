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

import {expect, Locator, Page, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_notificationsBtn, SELECTOR_notificationsDialogCloseButton, SettingsDialogSelectors} from '../../support/constants';

async function expectInsideViewport(page: Page, locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

const settingsNodes = [/automated workflow/i, /editor/i, /language/i, /namespace/i, /copyright/i];

test.describe('Responsive dialogs', () => {
  for (const viewport of [
    {width: 800, height: 600},
    {width: 640, height: 480},
    {width: 480, height: 640},
  ]) {
    test(`settings dialog stays usable at ${viewport.width}x${viewport.height}`, async ({page}) => {
      await page.setViewportSize(viewport);
      const app = new AppHelper(page);
      await app.startModelling();

      for (const node of settingsNodes) {
        await app.openSettings(node);
        const dialog = page.locator('mat-dialog-container');

        await expectInsideViewport(page, dialog);
        await expectInsideViewport(page, page.locator(SettingsDialogSelectors.settingsDialogOkButton));
        await expectInsideViewport(page, page.locator(SettingsDialogSelectors.settingsDialogCancelButton));
        await expectInsideViewport(page, page.locator(SettingsDialogSelectors.settingsDialogApplyButton));
        await expectInsideViewport(page, page.getByTestId('settingsModalCloseButton'));

        await page.locator(SettingsDialogSelectors.settingsDialogCancelButton).click();
        await expect(dialog).not.toBeVisible();
      }
    });
  }

  test('settings content scrolls instead of pushing the actions out of the dialog', async ({page}) => {
    await page.setViewportSize({width: 640, height: 480});
    const app = new AppHelper(page);
    await app.startModelling();
    await app.openSettings(/editor/i);

    const content = page.locator('.settings__dialog-content');
    const overflow = await content.evaluate(el => getComputedStyle(el).overflowY);
    expect(['auto', 'scroll']).toContain(overflow);

    const contentBox = await content.boundingBox();
    const actionsBox = await page.locator('mat-dialog-actions').boundingBox();
    expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(actionsBox.y + 1);

    await page.locator(SettingsDialogSelectors.settingsDialogCancelButton).click();
  });

  test('settings dialog keeps its regular size on large screens', async ({page}) => {
    await page.setViewportSize({width: 1600, height: 1000});
    const app = new AppHelper(page);
    await app.startModelling();
    await app.openSettings();

    const box = await page.locator('mat-dialog-container').boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(720);
    expect(Math.round(box.height)).toBeGreaterThanOrEqual(630);
    expect(Math.round(box.height)).toBeLessThanOrEqual(650);

    await page.locator(SettingsDialogSelectors.settingsDialogCancelButton).click();
  });

  test('notifications dialog stays inside a small window', async ({page}) => {
    await page.setViewportSize({width: 800, height: 600});
    const app = new AppHelper(page);
    await app.visitDefault();

    await page.locator(SELECTOR_notificationsBtn).click();
    const dialog = page.locator('mat-dialog-container');
    await expectInsideViewport(page, dialog);
    await expectInsideViewport(page, page.locator(SELECTOR_notificationsDialogCloseButton));

    await page.locator(SELECTOR_notificationsDialogCloseButton).click();
    await expect(dialog).not.toBeVisible();
  });
});
