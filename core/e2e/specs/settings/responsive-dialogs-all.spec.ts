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
import {API_BASE_URL, NAMESPACES_URL, SAMM_VERSION_ACTUAL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_fileMenuDeleteButton, SELECTOR_openFileMenu, SELECTOR_workspaceBtn} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';
import {TauriHelper} from '../../support/tauri-helper';

/**
 * Every dialog must fit into small windows: the dialog itself and all of its action buttons
 * have to be fully visible, otherwise the user cannot confirm or cancel it.
 */

const SMALL_VIEWPORTS = [
  {width: 800, height: 600},
  {width: 640, height: 480},
  // narrow portrait window: smaller than the former fixed minimum widths (500/550/700px)
  {width: 480, height: 640},
];

async function isInsideViewport(page: Page, locator: Locator): Promise<boolean> {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  if (!box) return false;
  return box.x >= -0.5 && box.y >= -0.5 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1;
}

async function expectDialogFits(page: Page, minActionButtons = 1): Promise<Locator> {
  const dialog = page.locator('mat-dialog-container').last();
  await expect(dialog).toBeVisible();
  await expect.poll(() => isInsideViewport(page, dialog), {message: 'dialog inside viewport'}).toBe(true);

  const buttons = dialog.locator('mat-dialog-actions button, .dialog-actions button, [mat-dialog-close], ame-dialog-close-button button');
  await expect.poll(() => buttons.count(), {message: 'action buttons rendered'}).toBeGreaterThanOrEqual(minActionButtons);

  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    if (!(await button.isVisible())) continue;
    await expect.poll(() => isInsideViewport(page, button), {message: `action button ${i} inside viewport`}).toBe(true);
  }

  // The surface must never be wider than the window (horizontal scrolling of inner tables is fine).
  const surfaceWidth = await dialog.locator('.mat-mdc-dialog-surface').evaluate(el => el.getBoundingClientRect().width);
  expect(surfaceWidth).toBeLessThanOrEqual(page.viewportSize().width);
  return dialog;
}

async function mockWorkspace(page: Page): Promise<void> {
  await setUpDefaultRoutes(page);
  await page.route(`**${NAMESPACES_URL}`, route =>
    route.fulfill({
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
    }),
  );
  await page.route(`**${API_BASE_URL}/models/batch`, route =>
    route.fulfill({
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
    }),
  );
}

async function openFileMenu(page: Page): Promise<void> {
  await page.locator(SELECTOR_workspaceBtn).click({force: true});
  await expect(page.locator('ame-workspace-file-list')).toBeVisible();
  await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
  const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
  await expect(fileMenuBtn).toBeVisible({timeout: 10000});
  await fileMenuBtn.click();
}

for (const viewport of SMALL_VIEWPORTS) {
  const size = `${viewport.width}x${viewport.height}`;

  test.describe(`Dialogs fit into a ${size} window`, () => {
    test.describe('with a loaded model', () => {
      let app: AppHelper;
      let tauri: TauriHelper;

      test.beforeEach(async ({page}) => {
        await page.setViewportSize(viewport);
        app = new AppHelper(page);
        tauri = new TauriHelper(page);
        await tauri.initTauriMock();
        await app.startModelling();
      });

      test('help dialog', async ({page}) => {
        await page.getByTestId('helpBtn').click();
        await expectDialogFits(page);
      });

      test('copy & paste text model dialog', async ({page}) => {
        await tauri.emitSignal('LOAD_FROM_TEXT');
        const dialog = await expectDialogFits(page, 2);
        await expect(dialog.locator('textarea')).toBeVisible();
      });

      test('prefix management dialog', async ({page}) => {
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        await page.getByTestId('tbPrefixesButton').click();
        await expectDialogFits(page);
      });

      test('connect with dialog', async ({page}) => {
        await app.getHTMLCell('property1').click({button: 'right'});
        await page.locator('.mxPopupMenu, .maxPopupMenu, table').getByText('Connect with').first().click();
        await expectDialogFits(page, 2);
      });

      test('rename model dialog after removing the aspect', async ({page}) => {
        await app.clickShape('AspectDefault');
        await tauri.emitSignal('REMOVE_SELECTED_ELEMENT');
        const dialog = await expectDialogFits(page, 2);
        await expect(dialog.locator('[data-testid="file-rename"]')).toBeVisible();
      });

      test('properties configuration dialog', async ({page}) => {
        await app.dbClickShape('AspectDefault');
        await page.getByTestId('properties-modal-button').click();
        await expectDialogFits(page, 2);
      });

      for (const signal of [
        'GENERATE_HTML_DOCUMENTATION',
        'GENERATE_OPEN_API_SPECIFICATION',
        'GENERATE_ASYNC_API_SPECIFICATION',
        'GENERATE_AASX_XML',
      ]) {
        test(`generate dialog (${signal})`, async ({page}) => {
          await tauri.emitSignal(signal);
          await expectDialogFits(page, 2);
        });
      }
    });

    test.describe('with a workspace', () => {
      test.beforeEach(async ({page}) => {
        await page.setViewportSize(viewport);
        await mockWorkspace(page);
        await new AppHelper(page).startModelling(false);
      });

      test('delete confirmation dialog', async ({page}) => {
        await openFileMenu(page);
        await page.locator(SELECTOR_fileMenuDeleteButton).click();
        await expectDialogFits(page, 2);
      });
    });
  });
}
