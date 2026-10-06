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
import {
  SELECTOR_fileMenuDeleteButton,
  SELECTOR_notificationsBtn,
  SELECTOR_openFileMenu,
  SELECTOR_workspaceBtn,
} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';
import {TauriHelper} from '../../support/tauri-helper';

/**
 * Dialogs must not close on a click outside of them. They close only through their buttons,
 * the (x) in the top right corner or Escape.
 */

const dialogs = (page: Page) => page.locator('mat-dialog-container');
const topDialog = (page: Page) => dialogs(page).last();

async function clickBackdrop(page: Page): Promise<void> {
  const backdrop = page.locator('.cdk-overlay-backdrop').last();
  await expect(backdrop).toBeAttached();
  await backdrop.click({position: {x: 3, y: 3}, force: true});
  // Give a (wrongly) closing dialog time for its exit animation.
  await page.waitForTimeout(300);
}

const CLOSE_BUTTON = '.close-button, [data-testid="settingsModalCloseButton"]';

async function expectCloseButtonInTopRight(dialog: Locator): Promise<Locator> {
  const close = dialog.locator(CLOSE_BUTTON).first();
  await expect(close).toBeVisible();
  // Polling: the dialog is still scaling in during its opening animation.
  await expect
    .poll(
      async () => {
        const [dialogBox, closeBox] = await Promise.all([dialog.boundingBox(), close.boundingBox()]);
        const inRightQuarter = closeBox.x + closeBox.width > dialogBox.x + dialogBox.width * 0.75;
        const atTop = closeBox.y - dialogBox.y < 60;
        const inside = closeBox.x + closeBox.width <= dialogBox.x + dialogBox.width + 1;
        return inRightQuarter && atTop && inside;
      },
      {message: '(x) is placed in the top right corner of the dialog'},
    )
    .toBe(true);
  return close;
}

type Opener = (page: Page, helpers: {app: AppHelper; tauri: TauriHelper}) => Promise<void>;

/** Dialogs reachable with a loaded model and how to open them. */
const MODEL_DIALOGS: Record<string, Opener> = {
  help: async page => page.getByTestId('helpBtn').click(),
  'copy & paste text model': async (_page, {tauri}) => tauri.emitSignal('LOAD_FROM_TEXT'),
  'prefix management': async page => {
    await page.mouse.move(400, 300);
    await page.getByTestId('tbPrefixesButton').click();
  },
  notifications: async page => page.locator(SELECTOR_notificationsBtn).click(),
  'connect with': async (page, {app}) => {
    await app.getHTMLCell('property1').click({button: 'right'});
    await page.locator('.mxPopupMenu, .maxPopupMenu, table').getByText('Connect with').first().click();
  },
  'generate documentation': async (_page, {tauri}) => tauri.emitSignal('GENERATE_HTML_DOCUMENTATION'),
  'generate OpenAPI': async (_page, {tauri}) => tauri.emitSignal('GENERATE_OPEN_API_SPECIFICATION'),
  'generate AsyncAPI': async (_page, {tauri}) => tauri.emitSignal('GENERATE_ASYNC_API_SPECIFICATION'),
  'generate AASX': async (_page, {tauri}) => tauri.emitSignal('GENERATE_AASX_XML'),
  settings: async (_page, {app}) => app.openSettings(),
};

test.describe('Dialog close behaviour', () => {
  let app: AppHelper;
  let tauri: TauriHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    tauri = new TauriHelper(page);
    await tauri.initTauriMock();
    await app.startModelling();
  });

  for (const [name, open] of Object.entries(MODEL_DIALOGS)) {
    test.describe(`${name} dialog`, () => {
      test('stays open on a click outside', async ({page}) => {
        await open(page, {app, tauri});
        await expect(topDialog(page)).toBeVisible();
        const count = await dialogs(page).count();

        await clickBackdrop(page);

        await expect(dialogs(page)).toHaveCount(count);
        await expect(topDialog(page)).toBeVisible();
      });

      test('closes with the (x) in the top right corner', async ({page}) => {
        await open(page, {app, tauri});
        const close = await expectCloseButtonInTopRight(topDialog(page));

        await close.click();

        await expect(dialogs(page)).toHaveCount(0);
      });

      test('closes with Escape', async ({page}) => {
        await open(page, {app, tauri});
        await expect(topDialog(page)).toBeVisible();

        await page.keyboard.press('Escape');

        await expect(dialogs(page)).toHaveCount(0);
      });
    });
  }

  test('properties dialog: outside click keeps it, (x) and Escape close only the properties dialog', async ({page}) => {
    await app.dbClickShape('AspectDefault');
    await page.getByTestId('properties-modal-button').click();
    await expect(dialogs(page)).toHaveCount(1);

    await clickBackdrop(page);
    await expect(dialogs(page)).toHaveCount(1);

    await expectCloseButtonInTopRight(topDialog(page));
    await topDialog(page).locator(CLOSE_BUTTON).first().click();
    await expect(dialogs(page)).toHaveCount(0);
    await expect(page.locator('ame-editor-dialog, ame-shape-settings').first()).toBeVisible();

    await page.getByTestId('properties-modal-button').click();
    await expect(dialogs(page)).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(dialogs(page)).toHaveCount(0);
  });

  test('rename model dialog (after removing the aspect) closes with Escape like "cancel"', async ({page}) => {
    await app.clickShape('AspectDefault');
    await tauri.emitSignal('REMOVE_SELECTED_ELEMENT');
    const dialog = topDialog(page);
    await expect(dialog.locator('[data-testid="file-rename"]')).toBeVisible();

    await clickBackdrop(page);
    await expect(dialog).toBeVisible();

    await expectCloseButtonInTopRight(dialog);
    await page.keyboard.press('Escape');
    await expect(dialogs(page)).toHaveCount(0);
  });

  test('JSON schema preview: no language pre-selection; outside click keeps it, (x) and Escape close it', async ({page}) => {
    await page.route('**/ame/api/generate/json-schema**', route =>
      route.fulfill({status: 200, contentType: 'application/json', body: '{"type":"object"}'}),
    );

    await tauri.emitSignal('GENERATE_JSON_SCHEMA');
    const preview = page.getByRole('dialog', {name: 'JSON Schema preview'});
    await expect(preview).toBeVisible();
    await expect(page.getByTestId('language-selector')).toHaveCount(0);
    await expect(page.locator('ame-loading-screen')).toHaveCount(0);

    await clickBackdrop(page);
    await expect(preview).toBeVisible();

    const close = await expectCloseButtonInTopRight(preview);
    await close.click();
    await expect(dialogs(page)).toHaveCount(0);

    await tauri.emitSignal('GENERATE_JSON_SCHEMA');
    await expect(preview).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialogs(page)).toHaveCount(0);
  });

  test('Escape inside an open select only closes the select, not the dialog', async ({page}) => {
    await tauri.emitSignal('GENERATE_OPEN_API_SPECIFICATION');
    const dialog = topDialog(page);
    await expect(dialog).toBeVisible();
    const select = dialog.locator('mat-select').first();
    await select.click();
    await expect(page.locator('mat-option').first()).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.locator('mat-option')).toHaveCount(0);
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialogs(page)).toHaveCount(0);
  });

  test('settings title and (x) sit at the same place as in the other dialogs', async ({page}) => {
    async function headerOffsets(
      open: () => Promise<void>,
    ): Promise<{title: number; titleLeft: number; close: number; closeRight: number}> {
      await open();
      const dialog = topDialog(page);
      const title = dialog.locator('[mat-dialog-title], .mat-mdc-dialog-title').first();
      const close = dialog.locator(CLOSE_BUTTON).first();
      await expect(title).toBeVisible();
      await page.waitForTimeout(400); // opening animation
      const [d, t, c] = await Promise.all([dialog.boundingBox(), title.boundingBox(), close.boundingBox()]);
      await page.keyboard.press('Escape');
      await expect(dialogs(page)).toHaveCount(0);
      return {title: t.y - d.y, titleLeft: t.x - d.x, close: c.y - d.y, closeRight: d.x + d.width - (c.x + c.width)};
    }

    const help = await headerOffsets(() => page.getByTestId('helpBtn').click());
    const openApi = await headerOffsets(() => tauri.emitSignal('GENERATE_OPEN_API_SPECIFICATION'));
    const settings = await headerOffsets(() => app.openSettings());

    for (const reference of [help, openApi]) {
      expect(Math.abs(settings.title - reference.title)).toBeLessThanOrEqual(2);
      expect(Math.abs(settings.titleLeft - reference.titleLeft)).toBeLessThanOrEqual(2);
      expect(Math.abs(settings.close - reference.close)).toBeLessThanOrEqual(2);
      expect(Math.abs(settings.closeRight - reference.closeRight)).toBeLessThanOrEqual(2);
    }
  });

  test('every (x) button has an accessible label', async ({page}) => {
    for (const open of [MODEL_DIALOGS.help, MODEL_DIALOGS['copy & paste text model'], MODEL_DIALOGS['generate AASX']]) {
      await open(page, {app, tauri});
      const close = topDialog(page).locator(CLOSE_BUTTON).first();
      await expect(close).toBeVisible();
      const label = (await close.getAttribute('aria-label')) ?? (await close.getAttribute('title')) ?? (await close.textContent());
      expect(label?.trim().length).toBeGreaterThan(0);
      await page.keyboard.press('Escape');
      await expect(dialogs(page)).toHaveCount(0);
    }
  });
});

test.describe('Dialog close behaviour - delete confirmation', () => {
  test.beforeEach(async ({page}) => {
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
    await page.route(`**${API_BASE_URL}/models/batch*`, route =>
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
    await new AppHelper(page).startModelling(false);
  });

  async function openDeleteConfirmation(page: Page): Promise<number[]> {
    const deletes: number[] = [];
    await page.route('**/ame/api/models', route => {
      if (route.request().method() === 'DELETE') deletes.push(Date.now());
      return route.fallback();
    });
    await page.locator(SELECTOR_workspaceBtn).click({force: true});
    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    await page.locator(SELECTOR_openFileMenu).first().click();
    await page.locator(SELECTOR_fileMenuDeleteButton).click();
    await expect(topDialog(page)).toBeVisible();
    return deletes;
  }

  test('outside click, (x) and Escape never delete the file', async ({page}) => {
    const deletes = await openDeleteConfirmation(page);

    await clickBackdrop(page);
    await expect(topDialog(page)).toBeVisible();

    const close = await expectCloseButtonInTopRight(topDialog(page));
    await expect(topDialog(page).locator('.close-button')).toHaveCount(1);
    await close.click();
    await expect(dialogs(page)).toHaveCount(0);

    await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).hover();
    await page.locator(SELECTOR_openFileMenu).first().click();
    await page.locator(SELECTOR_fileMenuDeleteButton).click();
    await expect(topDialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialogs(page)).toHaveCount(0);

    await page.waitForTimeout(300);
    expect(deletes).toHaveLength(0);
    await expect(page.getByRole('button', {name: 'Select file SampleModel.ttl'})).toBeVisible();
  });
});
