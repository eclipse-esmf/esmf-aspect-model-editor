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
import {API_BASE_URL, MODELS_API_URL, NAMESPACES_URL, SAMM_VERSION_ACTUAL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_workspaceBtn} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test workspace file elements filtering', () => {
  test('can open workspace file elements and filter properties, characteristics, and entities', async ({page}) => {
    const helper = new AppHelper(page);

    await setUpDefaultRoutes(page);

    const rdfString = readFixture('all-characteristic');
    const defaultTtl = readFixture('default-models/aspect-default.txt');

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
                  name: 'AspectDefault.ttl',
                  model: 'AspectDefault.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectDefault',
                  version: SAMM_VERSION_ACTUAL,
                  existing: true,
                },
                {
                  name: 'AspectElements.ttl',
                  model: 'AspectElements.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectElements',
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
            aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectDefault',
            aspectModel: defaultTtl,
            absoluteName: 'org.eclipse.examples.aspect:1.0.0:AspectDefault.ttl',
            fileName: 'AspectDefault.ttl',
            modelVersion: SAMM_VERSION_ACTUAL,
          },
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectElements',
            aspectModel: rdfString,
            absoluteName: 'org.eclipse.examples.aspect:1.0.0:AspectElements.ttl',
            fileName: 'AspectElements.ttl',
            modelVersion: SAMM_VERSION_ACTUAL,
          },
        ]),
      });
    });

    await page.route(`**${MODELS_API_URL}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({content: rdfString, sourceLocation: 'AspectElements.ttl'}),
      });
    });

    await helper.startModelling(false);

    // Open workspace sidebar
    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await expect(page.locator('ame-workspace-file-list')).toBeVisible();

    // Click on the non-current aspect model file in the workspace to view its elements
    await page.locator('.file').filter({hasText: 'AspectElements.ttl'}).click({force: true});

    // File elements view should be visible
    await expect(page.locator('ame-workspace-file-elements')).toBeVisible();
    await expect(page.locator('[data-testid="fileElementsList"]')).toBeVisible();

    // Check sections exist initially
    await expect(page.locator('[data-testid="section-property"]')).toBeAttached();
    await expect(page.locator('[data-testid="section-characteristic"]')).toBeAttached();

    // Open filter menu
    await page.locator('[data-testid="elementsFilterBtn"]').click({force: true});
    await expect(page.locator('.filter-menu')).toBeVisible();

    // Toggle off Property filter
    await page.locator('[data-testid="filterCheckbox-property"]').click();
    await expect(page.locator('[data-testid="section-property"]')).not.toBeAttached();
    await expect(page.locator('[data-testid="section-characteristic"]')).toBeAttached();

    // Toggle off Characteristic filter
    await page.locator('[data-testid="filterCheckbox-characteristic"]').click();
    await expect(page.locator('[data-testid="section-characteristic"]')).not.toBeAttached();

    // Toggle back on Property filter
    await page.locator('[data-testid="filterCheckbox-property"]').click();
    await expect(page.locator('[data-testid="section-property"]')).toBeAttached();

    // Toggle back on Characteristic filter
    await page.locator('[data-testid="filterCheckbox-characteristic"]').click();
    await expect(page.locator('[data-testid="section-characteristic"]')).toBeAttached();
  });
});
