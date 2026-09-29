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
import {SELECTOR_fileMenuCopyToClipboardButton, SELECTOR_openFileMenu, SELECTOR_workspaceBtn} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Workspace - Copy File Path to Clipboard', () => {
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

    await page.route(`**${API_BASE_URL}/models/storage-path`, async route => {
      await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({storagePath: '/tmp/aspect-models'})});
    });
  });

  test('can copy file path from file actions context menu', async ({page}) => {
    const app = new AppHelper(page);
    await app.startModelling(false);

    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await expect(page.locator('ame-workspace-file-list')).toBeVisible();

    // The file menu button is only rendered on hover of the file row
    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
    await expect(fileMenuBtn).toBeVisible({timeout: 10000});
    await fileMenuBtn.click();

    const copyBtn = page.locator(SELECTOR_fileMenuCopyToClipboardButton);
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Success toast confirms the copied OS file path
    const toast = page.locator('.toast-success').first();
    await expect(toast).toBeVisible({timeout: 5000});
    await expect(toast).toContainText('SampleModel.ttl');
  });
});
