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
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_editorCancelButton, SELECTOR_editorSaveButton} from '../../support/constants';
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
    const initialEvents = await tauri.getSentEvents('UPDATE_MENU_ITEM');
    expect(initialEvents.length).toBeGreaterThan(0);

    // Start modelling (adds cells to the graph)
    await tauri.clearSentEvents();
    await app.startModelling();

    // Check that Tauri received UPDATE_MENU_ITEM enabled=true for model actions
    await expect
      .poll(async () => {
        const events = await tauri.getSentEvents('UPDATE_MENU_ITEM');
        return events.some(e => e.args?.[0]?.ids?.includes('FORMAT_MODEL') && e.args?.[0]?.payload?.enabled === true);
      })
      .toBe(true);

    // Select a cell
    await tauri.clearSentEvents();
    await app.clickShape('AspectDefault');

    // Check that Tauri received UPDATE_MENU_ITEM enabled=true for selection actions
    await expect
      .poll(async () => {
        const events = await tauri.getSentEvents('UPDATE_MENU_ITEM');
        return events.some(e => e.args?.[0]?.ids?.includes('OPEN_SELECTED_ELEMENT') && e.args?.[0]?.payload?.enabled === true);
      })
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
    await expect.poll(async () => await getScale()).toBeGreaterThan(initialScale);
    const zoomedInScale = await getScale();

    // Zoom out
    await tauri.emitSignal('ZOOM_OUT');
    await expect.poll(async () => await getScale()).toBeLessThan(zoomedInScale);

    // Zoom to actual (100% = scale 1.0)
    await tauri.emitSignal('ZOOM_TO_ACTUAL');
    await expect.poll(async () => await getScale()).toBe(1);
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
});
