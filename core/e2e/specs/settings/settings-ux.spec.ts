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
import {SettingsDialogSelectors} from '../../support/constants';
import {TauriHelper} from '../../support/tauri-helper';

const dialog = (page: Page) => page.locator('mat-dialog-container').filter({has: page.getByTestId('settings-content')});
const node = (page: Page, id: string) => page.getByTestId(`settings-node-${id}`);
const apply = (page: Page) => page.locator(SettingsDialogSelectors.settingsDialogApplyButton);
const ok = (page: Page) => page.locator(SettingsDialogSelectors.settingsDialogOkButton);
const discardAlert = (page: Page) => page.locator('mat-dialog-container').filter({has: page.getByTestId('alert-right-btn')});

async function toggle(locator: Locator): Promise<void> {
  await locator.locator('button').first().click();
}

async function makeDirty(page: Page): Promise<void> {
  await node(page, 'editorConfiguration').click();
  await toggle(page.getByTestId('connectionLabelsToggle'));
  await expect(page.getByTestId('settings-dirty-indicator')).toBeVisible();
}

async function isInsideViewport(page: Page, locator: Locator): Promise<boolean> {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  return !!box && box.x >= -0.5 && box.y >= -0.5 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1;
}

test.describe('Settings dialog UX', () => {
  let app: AppHelper;

  test.describe('with a loaded model', () => {
    test.beforeEach(async ({page}) => {
      app = new AppHelper(page);
      await app.startModelling();
      await app.openSettings();
    });

    test('shows both groups with all sections and selects the first section', async ({page}) => {
      await expect(page.getByTestId('settings-group-systemConfiguration')).toBeVisible();
      await expect(page.getByTestId('settings-group-modelConfiguration')).toBeVisible();
      await expect(page.locator('[role="treeitem"]')).toHaveCount(5);
      await expect(node(page, 'automatedWorkflow')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('settings-section-header')).toContainText(/automated workflow/i);
      await expect(page.getByTestId('settings-section-description')).not.toBeEmpty();
    });

    test('a section header shows title, scope and description for every section', async ({page}) => {
      for (const id of [
        'automatedWorkflow',
        'editorConfiguration',
        'languageConfiguration',
        'namespaceConfiguration',
        'copyrightHeaderConfiguration',
      ]) {
        await node(page, id).click();
        await expect(node(page, id)).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByTestId('settings-section-header').locator('h3, h2').first()).not.toBeEmpty();
        await expect(page.getByTestId('settings-scope')).toBeVisible();
        await expect(page.getByTestId('settings-section-description')).not.toBeEmpty();
      }
    });

    test('the scope chip distinguishes application and model settings', async ({page}) => {
      await expect(page.getByTestId('settings-scope')).toContainText(/all models|alle modelle/i);
      await node(page, 'namespaceConfiguration').click();
      await expect(page.getByTestId('settings-scope')).toContainText('AspectDefault.ttl');
    });

    test('Apply is enabled only with changes and the dirty badge follows the changes', async ({page}) => {
      await expect(page.getByTestId('settings-dirty-indicator')).toHaveCount(0);
      await expect(apply(page)).toBeDisabled();

      await makeDirty(page);
      await expect(apply(page)).toBeEnabled();

      // Reverting the change makes the dialog pristine again.
      await toggle(page.getByTestId('connectionLabelsToggle'));
      await expect(page.getByTestId('settings-dirty-indicator')).toHaveCount(0);
      await expect(apply(page)).toBeDisabled();
    });

    test('Apply keeps the dialog open and resets the dirty state', async ({page}) => {
      await makeDirty(page);
      await apply(page).click();

      await expect(dialog(page)).toBeVisible();
      await expect(page.getByTestId('settings-dirty-indicator')).toHaveCount(0);
      await expect(apply(page)).toBeDisabled();
    });

    test('closing without changes via (x) or Escape does not ask', async ({page}) => {
      await page.getByTestId('settingsModalCloseButton').click();
      await expect(dialog(page)).toHaveCount(0);

      await app.openSettings();
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toHaveCount(0);
      await expect(discardAlert(page)).toHaveCount(0);
    });

    for (const via of ['(x)', 'Escape'] as const) {
      test(`unsaved changes: ${via} asks before discarding, "keep editing" keeps them`, async ({page}) => {
        await makeDirty(page);

        if (via === '(x)') await page.getByTestId('settingsModalCloseButton').click();
        else await page.keyboard.press('Escape');

        await expect(discardAlert(page)).toBeVisible();
        await page.getByTestId('alert-left-btn').click();

        await expect(discardAlert(page)).toHaveCount(0);
        await expect(dialog(page)).toBeVisible();
        await expect(page.getByTestId('settings-dirty-indicator')).toBeVisible();
      });

      test(`unsaved changes: ${via} + "discard" closes and drops the changes`, async ({page}) => {
        await node(page, 'editorConfiguration').click();
        const labels = page.getByTestId('connectionLabelsToggle').locator('button').first();
        const initial = await labels.getAttribute('aria-checked');
        await makeDirty(page);

        if (via === '(x)') await page.getByTestId('settingsModalCloseButton').click();
        else await page.keyboard.press('Escape');

        await page.getByTestId('alert-right-btn').click();
        await expect(dialog(page)).toHaveCount(0);

        await app.openSettings();
        await node(page, 'editorConfiguration').click();
        await expect(labels).toHaveAttribute('aria-checked', initial);
        await expect(page.getByTestId('settings-dirty-indicator')).toHaveCount(0);
      });
    }

    test('Escape on the discard question keeps editing', async ({page}) => {
      await makeDirty(page);
      await page.keyboard.press('Escape');
      await expect(discardAlert(page)).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(discardAlert(page)).toHaveCount(0);
      await expect(dialog(page)).toBeVisible();
    });

    test('Cancel discards changes without asking', async ({page}) => {
      await makeDirty(page);
      await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);
      await expect(discardAlert(page)).toHaveCount(0);
    });

    test('a click outside keeps the dialog open', async ({page}) => {
      await makeDirty(page);
      await page
        .locator('.cdk-overlay-backdrop')
        .last()
        .click({position: {x: 3, y: 3}, force: true});
      await page.waitForTimeout(300);
      await expect(dialog(page)).toBeVisible();
      await expect(discardAlert(page)).toHaveCount(0);
    });

    test('search filters the sections by the settings they contain', async ({page}) => {
      const search = page.getByTestId('settings-search');
      await search.fill('dark');
      await expect(page.locator('[role="treeitem"]')).toHaveCount(1);
      await expect(node(page, 'editorConfiguration')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('darkModeToggle')).toBeVisible();

      await search.fill('copyright');
      await expect(node(page, 'copyrightHeaderConfiguration')).toHaveAttribute('aria-selected', 'true');

      await search.fill('xyz-no-such-setting');
      await expect(page.getByTestId('settings-no-results')).toBeVisible();
      await expect(page.locator('[role="treeitem"]')).toHaveCount(0);

      await page.getByTestId('settings-search-clear').click();
      await expect(search).toHaveValue('');
      await expect(page.locator('[role="treeitem"]')).toHaveCount(5);
    });

    test('the sections can be navigated with the keyboard', async ({page}) => {
      await node(page, 'automatedWorkflow').focus();
      await page.keyboard.press('ArrowDown');
      await expect(node(page, 'editorConfiguration')).toHaveAttribute('aria-selected', 'true');
      await expect(node(page, 'editorConfiguration')).toBeFocused();

      await page.keyboard.press('End');
      await expect(node(page, 'copyrightHeaderConfiguration')).toHaveAttribute('aria-selected', 'true');

      await page.keyboard.press('ArrowUp');
      await expect(node(page, 'namespaceConfiguration')).toHaveAttribute('aria-selected', 'true');

      await page.keyboard.press('Home');
      await expect(node(page, 'automatedWorkflow')).toHaveAttribute('aria-selected', 'true');
    });

    test('the last opened section is shown again on the next opening', async ({page}) => {
      await node(page, 'copyrightHeaderConfiguration').click();
      await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);

      await app.openSettings();
      await expect(node(page, 'copyrightHeaderConfiguration')).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('[data-testid="copyright"]')).toBeVisible();
    });

    test('reset to defaults restores the section defaults', async ({page}) => {
      await node(page, 'automatedWorkflow').click();
      const timer = page.getByTestId('autoSaveTime');
      await timer.fill('300');
      await expect(page.getByTestId('settings-dirty-indicator')).toBeVisible();

      await page.getByTestId('settings-reset-section').click();

      await expect(timer).toHaveValue('60');
    });

    test('reset to defaults is not offered for model settings', async ({page}) => {
      for (const id of ['languageConfiguration', 'namespaceConfiguration', 'copyrightHeaderConfiguration']) {
        await node(page, id).click();
        await expect(page.getByTestId('settings-reset-section')).toHaveCount(0);
      }
    });

    test('invalid values are marked in the tree and summarised next to the buttons', async ({page}) => {
      await node(page, 'copyrightHeaderConfiguration').click();
      await page.locator('[data-testid="copyright"]').fill('no hash');

      await expect(node(page, 'copyrightHeaderConfiguration').getByTestId('settings-node-error')).toBeVisible();
      await expect(page.getByTestId('settings-error-summary')).toBeVisible();
      await expect(ok(page)).toBeDisabled();

      await node(page, 'automatedWorkflow').click();
      await page.getByTestId('settings-error-summary').click();
      await expect(node(page, 'copyrightHeaderConfiguration')).toHaveAttribute('aria-selected', 'true');

      await page.locator('[data-testid="copyright"]').fill('# fixed');
      await expect(page.getByTestId('settings-error-summary')).toHaveCount(0);
      await expect(ok(page)).toBeEnabled();
    });
  });

  test.describe('without a loaded model', () => {
    test.beforeEach(async ({page}) => {
      app = new AppHelper(page);
      await app.visitDefault();
      await app.openSettings();
    });

    test('the namespace section is marked as requiring a model and its fields are disabled', async ({page}) => {
      await expect(node(page, 'namespaceConfiguration').getByTestId('settings-node-requires-model')).toBeVisible();
      await node(page, 'namespaceConfiguration').click();

      await expect(page.getByTestId('settings-requires-model-hint')).toBeVisible();
      await expect(page.getByTestId('settings-scope')).toContainText(/no model|kein modell/i);
      await expect(page.getByTestId('namespaceTabValueInput')).toBeDisabled();
      await expect(page.getByTestId('namespaceTabVersionInput')).toBeDisabled();
      await expect(node(page, 'namespaceConfiguration').getByTestId('settings-node-error')).toHaveCount(0);
    });

    test('application settings can be saved without a model', async ({page}) => {
      await expect(ok(page)).toBeEnabled();
      await makeDirty(page);
      await expect(apply(page)).toBeEnabled();
      await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
    });
  });

  test.describe('small windows', () => {
    for (const viewport of [
      {width: 520, height: 600},
      {width: 800, height: 480},
    ]) {
      test(`stays fully usable at ${viewport.width}x${viewport.height}`, async ({page}) => {
        await page.setViewportSize(viewport);
        app = new AppHelper(page);
        await app.startModelling();
        await app.openSettings();

        for (const button of [
          ok(page),
          apply(page),
          page.locator(SettingsDialogSelectors.settingsDialogCancelButton),
          page.getByTestId('settingsModalCloseButton'),
        ]) {
          await expect.poll(() => isInsideViewport(page, button)).toBe(true);
        }

        await node(page, 'copyrightHeaderConfiguration').click();
        await expect(page.locator('[data-testid="copyright"]')).toBeVisible();
        await expect.poll(() => isInsideViewport(page, page.getByTestId('settings-search'))).toBe(true);
      });
    }

    test('the navigation becomes horizontal in narrow dialogs', async ({page}) => {
      await page.setViewportSize({width: 520, height: 700});
      app = new AppHelper(page);
      await app.startModelling();
      await app.openSettings();

      const first = await node(page, 'automatedWorkflow').boundingBox();
      const second = await node(page, 'editorConfiguration').boundingBox();
      expect(Math.abs(first.y - second.y)).toBeLessThan(first.height);
      expect(second.x).toBeGreaterThan(first.x);
    });
  });

  test.describe('menu', () => {
    test('the Tauri "Settings" menu item opens the dialog', async ({page}) => {
      const tauri = new TauriHelper(page);
      await tauri.initTauriMock();
      app = new AppHelper(page);
      await app.startModelling();
      await tauri.emitSignal('OPEN_SETTINGS');
      await expect(dialog(page)).toBeVisible();
    });
  });
});
