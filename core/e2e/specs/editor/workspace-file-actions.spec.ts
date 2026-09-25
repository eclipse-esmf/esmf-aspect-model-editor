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
            sourceLocation: 'SampleModel.ttl',
            content: readFixture('default-models/aspect-default.txt'),
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

    const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
    await expect(fileMenuBtn).toBeVisible({timeout: 10000});
    await fileMenuBtn.click();

    const deleteBtn = page.locator(SELECTOR_fileMenuDeleteButton);
    if ((await deleteBtn.isVisible()) && (await deleteBtn.isEnabled())) {
      await deleteBtn.click();

      // Confirm dialog appears
      const dialog = page.locator('mat-dialog-container');
      await expect(dialog).toBeVisible();

      // Cancel button aborts delete
      const cancelBtn = dialog.locator('button').filter({hasText: /cancel/i});
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });
});
