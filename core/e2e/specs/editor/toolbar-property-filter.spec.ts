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

import {expect, Page, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {readFixture} from '../../support/drag-drop-utils';
import {TauriHelper} from '../../support/tauri-helper';

const filterButton = (page: Page) => page.locator('[data-testid="tbPropertyFilterButton"]');

async function expectTooltip(page: Page, text: string) {
  await filterButton(page).hover();
  await expect(page.locator('.mat-mdc-tooltip').filter({hasText: text})).toBeVisible();
  await page.mouse.move(0, 400);
}

test.describe('Toolbar property filter', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
  });

  test('is disabled without a loaded model', async ({page}) => {
    await app.visitDefault();
    await expect(filterButton(page)).toBeVisible();
    await expect(filterButton(page)).toHaveClass(/disabled/);
  });

  test('toggles the property filter and keeps the model', async ({page}) => {
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await app.shapeExists('Characteristic1');

    await expect(filterButton(page)).not.toHaveClass(/disabled/);
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'false');
    await expectTooltip(page, 'show only Properties');

    await filterButton(page).click();
    await app.shapeExists('Characteristic1', false);
    await app.shapeExists('property1');
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(filterButton(page)).toHaveClass(/toolbar-item--active/);
    await expectTooltip(page, 'show the entire model');

    await filterButton(page).click();
    await app.shapeExists('Characteristic1');
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'false');

    const properties = await page.evaluate(() =>
      (window as any)['angular.LoadedFilesService'].currentLoadedFile.aspect.properties.map(
        (property: any) => `${property.name}:${property.characteristic?.name}`,
      ),
    );
    expect(properties).toEqual(['property1:Characteristic1']);
  });

  test('is disabled in the text view', async ({page}) => {
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await page.getByTestId('editor-view-text').click();
    await page.mouse.move(400, 400);
    await expect(page.getByTestId('canvas-area')).toHaveAttribute('data-view-mode', 'text');
    await expect(filterButton(page)).toHaveClass(/disabled/);
    await page.getByTestId('editor-view-graph').click();
    await page.mouse.move(400, 400);
    await expect(filterButton(page)).not.toHaveClass(/disabled/);
  });

  test('reflects the filter selected in the View menu', async ({page}) => {
    const tauri = new TauriHelper(page);
    await tauri.initTauriMock();
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));

    await tauri.emitSignal('FILTER_MODEL_BY', 'properties');
    await app.shapeExists('Characteristic1', false);
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'true');

    await filterButton(page).click();
    await app.shapeExists('Characteristic1');
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('becomes enabled as soon as a model is loaded', async ({page}) => {
    await app.visitDefault();
    await expect(filterButton(page)).toHaveClass(/disabled/);
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await expect(filterButton(page)).not.toHaveClass(/disabled/);
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('keeps working after toggling several times and after editing an element', async ({page}) => {
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));

    for (let i = 0; i < 3; i++) {
      await filterButton(page).click();
      await app.shapeExists('Characteristic1', false);
      await filterButton(page).click();
      await app.shapeExists('Characteristic1');
    }

    await filterButton(page).click();
    await app.dbClickShape('property1');
    await app.clickSaveButton();
    await app.shapeExists('Characteristic1', false);
    await expect(filterButton(page)).toHaveAttribute('aria-pressed', 'true');

    await filterButton(page).click();
    await app.shapeExists('Characteristic1');
  });

  test('stays visible and usable in a small window', async ({page}) => {
    await page.setViewportSize({width: 800, height: 600});
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await expect(filterButton(page)).toBeInViewport();
    await filterButton(page).click();
    await app.shapeExists('Characteristic1', false);
  });
});
