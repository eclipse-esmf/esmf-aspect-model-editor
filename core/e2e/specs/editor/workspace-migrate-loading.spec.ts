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
import {API_BASE_URL, NAMESPACES_URL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_workspaceBtn} from '../../support/constants';

test.describe('Workspace - Migration Button Loading State', () => {
  test('migration button displays spinner and is disabled while loading', async ({page}) => {
    const helper = new AppHelper(page);
    await setUpDefaultRoutes(page);

    // Provide a namespace with an outdated SAMM version (e.g. 1.0.0) so hasOutdatedFiles() returns true
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
                  name: 'OutdatedModel.ttl',
                  model: 'OutdatedModel.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#OutdatedModel',
                  version: '1.0.0',
                  existing: true,
                },
              ],
            },
          ],
        }),
      });
    });

    // Delay the batch response so we can assert the loading spinner
    await page.route(`**${API_BASE_URL}/models/batch*`, async route => {
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await helper.startModelling(false);

    // Open workspace sidebar
    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await expect(page.locator('ame-workspace-file-list')).toBeVisible();

    const migrateButton = page.locator('[data-testid="workspaceMigrateButton"]');
    if (await migrateButton.isVisible()) {
      await migrateButton.click();

      // Button should be disabled and show the progress spinner
      await expect(migrateButton).toBeDisabled();
      await expect(migrateButton.locator('mat-spinner, .spinner')).toBeVisible();
    }
  });
});
