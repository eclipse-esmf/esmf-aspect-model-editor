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
import {SELECTOR_editorCancelButton, SELECTOR_editorSaveButton, SELECTOR_tbValidateButton} from '../../support/constants';

type Box = {x: number; y: number; width: number; height: number};

const box = async (locator: Locator): Promise<Box> => {
  const bounds = await locator.boundingBox();
  if (!bounds) {
    throw new Error('element is not visible');
  }
  return bounds;
};

const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** The toasts are covering none of the given elements. */
async function expectUncovered(page: Page, targets: Locator[]) {
  const toasts = await Promise.all((await page.locator('.toast-container .ngx-toastr').all()).map(box));
  expect(toasts.length).toBeGreaterThan(0);
  for (const target of targets) {
    const targetBox = await box(target);
    expect(toasts.some(toast => overlaps(toast, targetBox))).toBe(false);
  }
}

test.describe('Notifications', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1400, height: 850});
    await new AppHelper(page).startModelling();
  });

  test('are shown at the top center and are 450px wide', async ({page}) => {
    await page.locator(SELECTOR_tbValidateButton).click();
    const toast = page.locator('.toast-container .ngx-toastr', {hasText: 'Validation completed successfully'});
    await expect(toast).toBeVisible();

    const viewport = page.viewportSize() ?? {width: 0, height: 0};
    const toastBox = await box(toast);
    expect(toastBox.width).toBe(450);
    expect(toastBox.y).toBeLessThan(viewport.height / 4);
    expect(Math.abs(toastBox.x + toastBox.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(2);
  });

  test('fit into a narrow window', async ({page}) => {
    await page.setViewportSize({width: 400, height: 850});
    await page.evaluate(() => (window as any)['angular.editorService'].validate().subscribe({error: () => undefined}));
    const toast = page.locator('.toast-container .ngx-toastr', {hasText: 'Validation completed successfully'});
    await expect(toast).toBeVisible();

    const toastBox = await box(toast);
    expect(toastBox.x).toBeGreaterThanOrEqual(0);
    expect(toastBox.x + toastBox.width).toBeLessThanOrEqual(400);
  });

  test('do not cover the actions of the edit dialog', async ({page}) => {
    await new AppHelper(page).dbClickShape('property1');
    await page.evaluate(() => (window as any)['angular.editorService'].validate().subscribe({error: () => undefined}));
    await expect(page.locator('.toast-container .ngx-toastr', {hasText: 'Validation completed successfully'})).toBeVisible();

    await expectUncovered(page, [page.locator(SELECTOR_editorSaveButton), page.locator(SELECTOR_editorCancelButton)]);
  });
});
