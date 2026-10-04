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
import {API_BASE_URL, NAMESPACES_URL, SAMM_VERSION_ACTUAL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {
  BUTTON_renameModelConfirm,
  FIELD_renameModelInput,
  SELECTOR_fileMenuDeleteButton,
  SELECTOR_openFileMenu,
  SELECTOR_workspaceBtn,
} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Workspace - File Actions (Rename, Delete)', () => {
  test.beforeEach(async ({page}) => {
    await setUpDefaultRoutes(page);

    await page.route(`**${NAMESPACES_URL}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'org.eclipse.examples.aspect': [
            {
              version: '1.0.0',
              models: [
                {
                  name: 'SampleModel.ttl',
                  model: 'SampleModel.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#SampleModel',
                  version: SAMM_VERSION_ACTUAL,
                  existing: true,
                },
              ],
            },
          ],
        }),
      });
    });

    await page.route(`**${API_BASE_URL}/models/batch`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#SampleModel',
            aspectModel: readFixture('default-models/aspect-default.txt'),
            absoluteName: 'org.eclipse.examples.aspect:1.0.0:SampleModel.ttl',
            fileName: 'SampleModel.ttl',
            modelVersion: SAMM_VERSION_ACTUAL,
          },
        ]),
      });
    });
  });

  test('can open rename dialog and validate input', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.startModelling(false);

    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await expect(page.locator('ame-workspace-file-list')).toBeVisible();

    // The file menu button is only rendered on hover of the file row
    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
    await expect(fileMenuBtn).toBeVisible({timeout: 10000});
    await fileMenuBtn.click();

    const renameBtn = page.locator('[data-testid="fileMenuRenameButton"]');
    if ((await renameBtn.isVisible()) && (await renameBtn.isEnabled())) {
      await renameBtn.click();

      // Rename dialog opens
      const renameInput = page.locator(FIELD_renameModelInput);
      await expect(renameInput).toBeVisible();

      // Clear input and check confirm button is disabled
      await renameInput.fill('');
      const confirmBtn = page.locator(BUTTON_renameModelConfirm);
      await expect(confirmBtn).toBeDisabled();

      // Close dialog
      await page
        .locator('mat-dialog-container button')
        .filter({hasText: /cancel/i})
        .click();
      await expect(renameInput).not.toBeVisible();
    }
  });

  test('can open delete confirmation dialog', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.startModelling(false);

    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await expect(page.locator('ame-workspace-file-list')).toBeVisible();

    // The file menu button is only rendered on hover of the file row
    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
    await expect(fileMenuBtn).toBeVisible({timeout: 10000});
    await fileMenuBtn.click();

    const deleteBtn = page.locator(SELECTOR_fileMenuDeleteButton);
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();

    // Confirm dialog appears
    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();

    // Closing the confirmation aborts the delete
    await dialog.locator('[data-testid="cancelBtn"]').click();
    await expect(dialog).not.toBeVisible();
  });

  for (const answer of ['cancel', 'ok'] as const) {
    test(`answering the delete confirmation with ${answer} ${answer === 'ok' ? 'deletes' : 'keeps'} the file`, async ({page}) => {
      const helper = new AppHelper(page);
      await helper.startModelling(false);

      const deleteRequests: string[] = [];
      await page.route('**/ame/api/models**', route => {
        if (route.request().method() === 'DELETE') {
          deleteRequests.push(route.request().url());
          return route.fulfill({status: 200, contentType: 'application/json', body: '{}'});
        }
        return route.fallback();
      });

      await page.locator(SELECTOR_workspaceBtn).click({force: true});
      await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
      await page.locator(SELECTOR_openFileMenu).first().click();
      await page.locator(SELECTOR_fileMenuDeleteButton).click();

      const dialog = page.locator('mat-dialog-container');
      await expect(dialog).toBeVisible();
      await dialog.getByTestId(answer === 'ok' ? 'okBtn' : 'cancelBtn').click();
      await expect(dialog).not.toBeVisible();

      if (answer === 'ok') {
        await expect.poll(() => deleteRequests.length).toBe(1);
      } else {
        await page.waitForTimeout(300);
        expect(deleteRequests).toHaveLength(0);
      }
    });
  }

  for (const dismiss of ['Escape', 'close button'] as const) {
    test(`dismissing the delete confirmation via ${dismiss} keeps the file`, async ({page}) => {
      const helper = new AppHelper(page);
      await helper.startModelling(false);

      let deleteRequests = 0;
      await page.route('**/ame/api/models', route => {
        if (route.request().method() === 'DELETE') deleteRequests++;
        return route.fallback();
      });

      await page.locator(SELECTOR_workspaceBtn).click({force: true});
      const fileRow = page.getByRole('button', {name: 'Select file SampleModel.ttl'});
      await fileRow.hover();
      await page.locator(SELECTOR_openFileMenu).first().click();
      await page.locator(SELECTOR_fileMenuDeleteButton).click();

      const dialog = page.locator('mat-dialog-container');
      await expect(dialog).toBeVisible();
      if (dismiss === 'Escape') {
        await page.keyboard.press('Escape');
      } else {
        await dialog.getByTestId('dialog-close-button').click();
      }
      await expect(dialog).not.toBeVisible();

      await page.waitForTimeout(300);
      expect(deleteRequests).toBe(0);
      await expect(fileRow).toBeVisible();
    });
  }

  test('a click outside the delete confirmation neither closes it nor deletes the file', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.startModelling(false);

    let deleteRequests = 0;
    await page.route('**/ame/api/models', route => {
      if (route.request().method() === 'DELETE') deleteRequests++;
      return route.fallback();
    });

    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    await page.locator(SELECTOR_openFileMenu).first().click();
    await page.locator(SELECTOR_fileMenuDeleteButton).click();

    const dialog = page.locator('mat-dialog-container');
    await expect(dialog).toBeVisible();
    await page
      .locator('.cdk-overlay-backdrop')
      .last()
      .click({position: {x: 5, y: 5}, force: true});

    await page.waitForTimeout(300);
    await expect(dialog).toBeVisible();
    expect(deleteRequests).toBe(0);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    expect(deleteRequests).toBe(0);
  });

  test('opens the file menu below its trigger even after the row loses hover', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.startModelling(false);

    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await expect(page.locator('ame-workspace-file-list')).toBeVisible();

    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
    await expect(fileMenuBtn).toBeVisible({timeout: 10000});
    await fileMenuBtn.click();

    const menuPanel = page.locator('.mat-mdc-menu-panel').first();
    await expect(menuPanel).toBeVisible();
    // The menu backdrop takes over the hover; the trigger must stay visible as menu anchor.
    await page.mouse.move(600, 500);
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await expect(fileMenuBtn).toBeVisible();

    const triggerBox = await fileMenuBtn.boundingBox();
    const menuBox = await menuPanel.boundingBox();
    if (!triggerBox || !menuBox) {
      throw new Error('File menu trigger or panel has no bounding box');
    }
    expect(Math.abs(menuBox.y - (triggerBox.y + triggerBox.height))).toBeLessThan(12);
    expect(menuBox.x + menuBox.width).toBeGreaterThan(triggerBox.x);
  });
});
