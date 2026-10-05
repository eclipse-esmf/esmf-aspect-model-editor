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
import {SELECTOR_tbDeleteButton, SELECTOR_workspaceBtn} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

test.describe('Workspace element list dynamic update on graph element removal', () => {
  test('element in workspace list becomes disabled when added and re-enabled when deleted from graph', async ({page}) => {
    const helper = new AppHelper(page);

    await setUpDefaultRoutes(page);

    const rdfString = readFixture('all-characteristic');

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

    await page.route(`**${API_BASE_URL}/models/batch*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectDefault',
            aspectModel: readFixture('default-models/aspect-default.txt'),
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

    // Open file elements for the external file
    await page.locator('.file').filter({hasText: 'AspectElements.ttl'}).click({force: true});
    await expect(page.locator('ame-workspace-file-elements')).toBeVisible();
    await expect(page.locator('[data-testid="fileElementsList"]')).toBeVisible();

    const draggableElement = page.locator('ame-draggable-element.element').first();
    await expect(draggableElement).toBeVisible();
    await expect(draggableElement).not.toHaveClass(/disabled/);

    const elementUrn = (await draggableElement.getAttribute('data-urn')) ?? '';
    const elementName = elementUrn.split('#').pop() ?? '';

    // Drag the element into the graph
    await dragElementToGraph(page, 'ame-draggable-element.element', 350, 250);

    // After adding to graph, the element in the workspace list should now be disabled
    await expect(draggableElement).toHaveClass(/disabled/, {timeout: 5000});

    // Delete element from the graph
    await helper.clickShape(elementName);
    await page.locator(SELECTOR_tbDeleteButton).click();

    // Element in workspace list must immediately update to enabled without manual refresh
    await expect(draggableElement).not.toHaveClass(/disabled/, {timeout: 5000});
  });
});
