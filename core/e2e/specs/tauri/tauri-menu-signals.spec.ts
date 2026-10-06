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
import {SELECTOR_editorCancelButton, SELECTOR_editorSaveButton} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';
import {TauriHelper} from '../../support/tauri-helper';

test.describe('Tauri Menu & IPC Integration', () => {
  let app: AppHelper;
  let tauri: TauriHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    tauri = new TauriHelper(page);
    await tauri.initTauriMock();
    await app.visitDefault();
  });

  test('should synchronize menu item states when model is loaded and cells are selected', async ({page}) => {
    // Check initial window focus and menu update for empty model
    await expect
      .poll(async () => {
        const initialEvents = await tauri.getSentEvents('UPDATE_MENU_ITEM');
        return initialEvents.length;
      })
      .toBeGreaterThan(0);

    // Start modelling (adds cells to the graph)
    await tauri.clearSentEvents();
    await app.startModelling();

    // Check that Tauri received UPDATE_MENU_ITEM enabled=true for model actions
    await expect
      .poll(
        async () => {
          const events = await tauri.getSentEvents('UPDATE_MENU_ITEM');
          return events.some(e => e.args?.[0]?.ids?.includes('FORMAT_MODEL') && e.args?.[0]?.payload?.enabled === true);
        },
        {timeout: 10000},
      )
      .toBe(true);

    // Select a cell
    await tauri.clearSentEvents();
    await app.clickShape('AspectDefault');

    // Check that Tauri received UPDATE_MENU_ITEM enabled=true for selection actions
    await expect
      .poll(
        async () => {
          const events = await tauri.getSentEvents('UPDATE_MENU_ITEM');
          return events.some(e => e.args?.[0]?.ids?.includes('OPEN_SELECTED_ELEMENT') && e.args?.[0]?.payload?.enabled === true);
        },
        {timeout: 10000},
      )
      .toBe(true);
  });

  test('should toggle toolbar and minimap via Tauri menu signals', async ({page}) => {
    const toolbar = page.locator('ame-editor-toolbar');
    await expect(toolbar).toBeVisible();

    // Hide toolbar
    await tauri.emitSignal('SHOW_HIDE_TOOLBAR');
    await expect(toolbar).not.toBeVisible();

    // Show toolbar
    await tauri.emitSignal('SHOW_HIDE_TOOLBAR');
    await expect(toolbar).toBeVisible();

    // Toggle minimap
    const minimap = page.locator('#outline');
    await expect(minimap).not.toHaveClass(/hidden/);

    await tauri.emitSignal('SHOW_HIDE_MINIMAP');
    await expect(minimap).toHaveClass(/hidden/);

    await tauri.emitSignal('SHOW_HIDE_MINIMAP');
    await expect(minimap).not.toHaveClass(/hidden/);
  });

  test('should open Copy Paste text model dialog via LOAD_FROM_TEXT signal', async ({page}) => {
    await tauri.emitSignal('LOAD_FROM_TEXT');
    const modal = page.locator('ame-text-model-loader-modal, mat-dialog-container');
    await expect(modal).toBeVisible();
    await page.locator('[data-testid="cancel-btn"], [data-testid="dialog-cancel-btn"], button:has-text("Cancel")').first().click();
    await expect(modal).not.toBeVisible();
  });

  test('should open elements and files search via search signals', async ({page}) => {
    await app.startModelling();

    // Search elements
    await tauri.emitSignal('SEARCH_ELEMENTS');
    const elementsSearch = page.locator('ame-elements-search');
    await expect(elementsSearch).toBeVisible();
    await elementsSearch.locator('.background').click();
    await expect(elementsSearch).not.toBeVisible();

    // Search files
    await tauri.emitSignal('SEARCH_FILES');
    const filesSearch = page.locator('ame-files-search');
    await expect(filesSearch).toBeVisible();
    await filesSearch.locator('.background').click();
    await expect(filesSearch).not.toBeVisible();
  });

  test('should edit and remove selected element via Tauri menu signals', async ({page}) => {
    await app.startModelling();
    await app.clickShape('property1');

    // Trigger OPEN_SELECTED_ELEMENT signal
    await tauri.emitSignal('OPEN_SELECTED_ELEMENT');
    await expect(page.locator(SELECTOR_editorSaveButton)).toBeVisible();
    await page.locator(SELECTOR_editorCancelButton).click();
    await expect(page.locator(SELECTOR_editorSaveButton)).not.toBeVisible();

    // Select and trigger REMOVE_SELECTED_ELEMENT signal
    await app.clickShape('property1');
    await tauri.emitSignal('REMOVE_SELECTED_ELEMENT');
    await expect(app.getHTMLCell('property1')).not.toBeVisible();
  });

  test('should trigger validation and show notifications via Tauri IPC', async ({page}) => {
    await app.startModelling();

    // Trigger notification
    await tauri.emitSignal('SHOW_NOTIFICATION', 'Test Tauri notification');
    await expect(page.locator('.toast-title').filter({hasText: 'Test Tauri notification'})).toBeVisible();

    // Trigger VALIDATE_MODEL
    await tauri.emitSignal('VALIDATE_MODEL');
    // Validation runs and validates current file
    await expect(page.locator('#graph')).toBeVisible();
  });

  test('should zoom graph via zoom signals', async ({page}) => {
    await app.startModelling();

    const getScale = async () => {
      return await page.evaluate(() => {
        const maxgraphAttributeService = (window as any)['angular.maxgraphAttributeService'];
        return maxgraphAttributeService?.graph?.getView()?.getScale() || 1;
      });
    };

    const initialScale = await getScale();

    // Zoom in
    await tauri.emitSignal('ZOOM_IN');
    await expect.poll(async () => await getScale(), {timeout: 10000}).toBeGreaterThan(initialScale);
    const zoomedInScale = await getScale();

    // Zoom out
    await tauri.emitSignal('ZOOM_OUT');
    await expect.poll(async () => await getScale(), {timeout: 10000}).toBeLessThan(zoomedInScale);

    // Zoom to actual (100% = scale 1.0)
    await tauri.emitSignal('ZOOM_TO_ACTUAL');
    await expect.poll(async () => await getScale(), {timeout: 10000}).toBe(1);
  });

  test.describe('zoom in with the "+" key (e.g. German keyboard, numpad)', () => {
    const getScale = (page: Page) =>
      page.evaluate(() => (window as any)['angular.maxgraphAttributeService']?.graph?.getView()?.getScale() || 1);

    const pressCmdOrCtrlPlus = async (page: Page) => {
      await page.keyboard.down('ControlOrMeta');
      await page.keyboard.press('+');
      await page.keyboard.up('ControlOrMeta');
    };

    test('Cmd/Ctrl + "+" zooms in exactly one step', async ({page}) => {
      await app.startModelling();
      const initialScale = await getScale(page);

      await pressCmdOrCtrlPlus(page);
      await expect.poll(() => getScale(page), {timeout: 10000}).toBeGreaterThan(initialScale);
      const afterKey = await getScale(page);

      // The menu accelerator may fire for the same key press as well; that must not zoom a second time.
      await tauri.emitSignal('ZOOM_IN');
      await page.waitForTimeout(500);
      expect(await getScale(page)).toBe(afterKey);
    });

    test('a later key press zooms again', async ({page}) => {
      await app.startModelling();

      await pressCmdOrCtrlPlus(page);
      await expect.poll(() => getScale(page), {timeout: 10000}).toBeGreaterThan(1);
      const first = await getScale(page);
      await page.waitForTimeout(300);

      await pressCmdOrCtrlPlus(page);
      await expect.poll(() => getScale(page), {timeout: 10000}).toBeGreaterThan(first);
    });

    test('"+" without Cmd/Ctrl does not zoom', async ({page}) => {
      await app.startModelling();
      const initialScale = await getScale(page);

      await page.keyboard.press('+');
      await page.waitForTimeout(500);

      expect(await getScale(page)).toBe(initialScale);
    });
  });

  test('should keep the model when filtering by properties and back via FILTER_MODEL_BY', async ({page}) => {
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await app.shapeExists('Characteristic1');
    const modelState = () =>
      page.evaluate(() => {
        const graph = (window as any)['angular.maxgraphAttributeService'].graph;
        const aspect = (window as any)['angular.LoadedFilesService'].currentLoadedFile.aspect;
        return {
          shapes: graph.getChildCells(graph.getDefaultParent(), true, false).length,
          properties: aspect.properties.map((property: any) => `${property.name}:${property.characteristic?.name}`),
        };
      });
    const initial = await modelState();
    expect(initial.properties).toEqual(['property1:Characteristic1']);

    await tauri.emitSignal('FILTER_MODEL_BY', 'properties');
    await app.shapeExists('Characteristic1', false);
    await expect(page.locator('.cdk-overlay-container mat-dialog-container')).toHaveCount(0);
    expect((await modelState()).properties).toEqual(initial.properties);

    await tauri.emitSignal('FILTER_MODEL_BY', 'default');
    await app.shapeExists('Characteristic1');
    await expect(page.locator('.cdk-overlay-container mat-dialog-container')).toHaveCount(0);
    await expect.poll(modelState).toEqual(initial);
  });

  test('should format model and collapse/expand model via signals', async ({page}) => {
    await app.startModelling();

    // Trigger FORMAT_MODEL
    await tauri.emitSignal('FORMAT_MODEL');
    await expect(app.getHTMLCell('AspectDefault')).toBeVisible();

    // Trigger COLLAPSE_EXPAND_MODEL
    await tauri.emitSignal('COLLAPSE_EXPAND_MODEL');
    await expect(app.getHTMLCell('AspectDefault')).toBeVisible();
  });

  test('should edit element by URN via EDIT_ELEMENT request', async ({page}) => {
    await app.startModelling();

    // Emit EDIT_ELEMENT with AspectDefault URN
    await tauri.emitSignal('EDIT_ELEMENT', 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectDefault');
    await expect(page.locator(SELECTOR_editorSaveButton)).toBeVisible();
    await page.locator(SELECTOR_editorCancelButton).click();
    await expect(page.locator(SELECTOR_editorSaveButton)).not.toBeVisible();
  });

  test('should invoke openInVsCodeOrDefault when clicking file link in workspace error', async ({page}) => {
    // Open workspace sidebar
    const {SELECTOR_workspaceBtn} = await import('../../support/constants');
    await page.locator(SELECTOR_workspaceBtn).click();
    await expect(page.locator('ame-workspace')).toBeVisible();

    // Trigger workspace error
    await page.evaluate(() => {
      const workspaceComponent = (window as any)['angular.workspaceComponent'];
      if (workspaceComponent) {
        workspaceComponent.error.set({
          code: 400,
          message: 'File: /models/Invalid.ttl • Error: Parse error',
          path: '/models/Invalid.ttl',
        });
      }
    });

    const fileLink = page.locator('ame-workspace-error a.file-link');
    await expect(fileLink).toBeVisible();

    await tauri.clearSentEvents();
    await fileLink.click({force: true});

    await expect
      .poll(
        async () => {
          const events = await tauri.getSentEvents('openInVsCodeOrDefault');
          return events.some(e => e.args?.[0] === 'vscode://file//models/Invalid.ttl' && e.args?.[1] === '/models/Invalid.ttl');
        },
        {timeout: 10000},
      )
      .toBe(true);
  });

  test('should handle context menu right click on links for open in browser and copy link address', async ({page}) => {
    // Open workspace sidebar
    const {SELECTOR_workspaceBtn} = await import('../../support/constants');
    await page.locator(SELECTOR_workspaceBtn).click();
    await expect(page.locator('ame-workspace')).toBeVisible();

    // Trigger workspace error to show a link
    await page.evaluate(() => {
      const workspaceComponent = (window as any)['angular.workspaceComponent'];
      if (workspaceComponent) {
        workspaceComponent.error.set({
          code: 400,
          message: 'File: /models/Invalid.ttl • Error: Parse error',
          path: '/models/Invalid.ttl',
        });
      }
    });

    const fileLink = page.locator('ame-workspace-error a.file-link');
    await expect(fileLink).toBeVisible();

    // 1. Right click on the link to trigger native context menu
    await tauri.clearSentEvents();
    await fileLink.click({button: 'right', force: true});

    await expect
      .poll(
        async () => {
          const events = await tauri.getSentEvents('showContextMenu');
          return events.some(e => e.args?.[0]?.href?.includes('/models/Invalid.ttl'));
        },
        {timeout: 10000},
      )
      .toBe(true);

    // 2. Select "Copy link address" (ctx_copy) and verify copyToClipboard is triggered with the href
    await tauri.clearSentEvents();
    await tauri.triggerContextMenuAction('ctx_copy');

    await expect
      .poll(
        async () => {
          const events = await tauri.getSentEvents('copyToClipboard');
          return events.some(e => typeof e.args?.[0] === 'string' && e.args[0].includes('/models/Invalid.ttl'));
        },
        {timeout: 10000},
      )
      .toBe(true);

    // 3. Select "Open in browser" (ctx_open) and verify openExternalLink is triggered with the href
    await tauri.clearSentEvents();
    await tauri.triggerContextMenuAction('ctx_open');

    await expect
      .poll(
        async () => {
          const events = await tauri.getSentEvents('openExternalLink');
          return events.some(e => typeof e.args?.[0] === 'string' && e.args[0].includes('/models/Invalid.ttl'));
        },
        {timeout: 10000},
      )
      .toBe(true);
  });

  test('should open the settings dialog via the OPEN_SETTINGS signal (File/App menu, Cmd/Ctrl+,)', async ({page}) => {
    await app.startModelling();

    await tauri.emitSignal('OPEN_SETTINGS');
    const dialog = page.locator('ame-setting-dialog');
    await expect(dialog).toBeVisible();

    // Pressing the shortcut again must not stack a second settings dialog
    await tauri.emitSignal('OPEN_SETTINGS');
    await page.waitForTimeout(300);
    await expect(dialog).toHaveCount(1);

    await page.locator('[data-testid="settingsDialogCancelButton"]').click();
    await expect(dialog).toHaveCount(0);

    // and it can be opened again after closing
    await tauri.emitSignal('OPEN_SETTINGS');
    await expect(dialog).toBeVisible();
    await page.locator('[data-testid="settingsDialogCancelButton"]').click();
  });

  test('should open the settings dialog via OPEN_SETTINGS even without a loaded model', async ({page}) => {
    await tauri.emitSignal('OPEN_SETTINGS');
    await expect(page.locator('ame-setting-dialog')).toBeVisible();
  });
});
