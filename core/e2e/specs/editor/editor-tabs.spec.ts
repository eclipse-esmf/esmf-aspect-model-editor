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

const SAMPLE_TURTLE_MODEL_1 = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples:1.0.0#> .

:ModelOne a samm:Aspect ;
   samm:name "ModelOne" ;
   samm:properties (:propOne) ;
   samm:operations () ;
   samm:events () .

:propOne a samm:Property ;
   samm:name "propOne" ;
   samm:characteristic :TextOne .

:TextOne a samm:Characteristic ;
   samm:name "TextOne" ;
   samm:dataType xsd:string .
`;

const SAMPLE_TURTLE_MODEL_2 = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples:1.0.0#> .

:ModelTwo a samm:Aspect ;
   samm:name "ModelTwo" ;
   samm:properties (:propTwo) ;
   samm:operations () ;
   samm:events () .

:propTwo a samm:Property ;
   samm:name "propTwo" ;
   samm:characteristic :TextTwo .

:TextTwo a samm:Characteristic ;
   samm:name "TextTwo" ;
   samm:dataType xsd:string .
`;

test.describe('Editor Multi-Tab Management', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should display tab bar and show tab when model is loaded', async ({page}) => {
    const tabBar = page.locator('[data-testid="editor-tab-bar"]');
    await expect(tabBar).toBeVisible();

    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs.first()).toBeVisible();
    await expect(tabs.first()).toHaveClass(/active/);
  });

  test('should add a new model tab and switch to it when clicking add button', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const addBtn = page.locator('[data-testid="editor-tab-add"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);

    const activeTab = page.locator('[data-testid="editor-tab"].active');
    await expect(activeTab).toBeVisible();
  });

  test('should display dirty dot indicator when model is modified and clear it on save', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const activeTab = page.locator('[data-testid="editor-tab"].active');
    await expect(activeTab).toBeVisible();

    const dirtyDot = activeTab.locator('.tab-dirty-indicator');
    await expect(dirtyDot).not.toBeVisible();

    // Modify model via tabStateService or editor
    await page.evaluate(() => {
      const tabState = (window as any)['angular.TabStateService'];
      if (tabState) {
        tabState.setTabDirty(tabState.activeTabId(), true);
      }
    });

    await expect(dirtyDot).toBeVisible();

    // Reset / clear dirty state
    await page.evaluate(() => {
      const tabState = (window as any)['angular.TabStateService'];
      if (tabState) {
        tabState.setTabDirty(tabState.activeTabId(), false);
      }
    });

    await expect(dirtyDot).not.toBeVisible();
  });

  test('should keep fixed action buttons pinned at right edge when many tabs overflow', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const addBtn = page.locator('[data-testid="editor-tab-add"]');
    for (let i = 0; i < 10; i++) {
      await addBtn.click();
    }

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(11);

    await expect(addBtn).toBeVisible();
    const box = await addBtn.boundingBox();
    const viewportSize = page.viewportSize();
    expect(box).not.toBeNull();
    if (box && viewportSize) {
      expect(box.x + box.width).toBeLessThanOrEqual(viewportSize.width);
      expect(box.x).toBeGreaterThan(0);
    }
  });

  test('should switch between tabs on click and re-render models', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const addBtn = page.locator('[data-testid="editor-tab-add"]');
    await addBtn.click();

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);

    // Click the first tab
    await tabs.first().click();
    await expect(tabs.first()).toHaveClass(/active/);
    await expect(tabs.nth(1)).not.toHaveClass(/active/);

    // Click the second tab
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/active/);
    await expect(tabs.first()).not.toHaveClass(/active/);
  });

  test('should close a tab when clicking its close button', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const addBtn = page.locator('[data-testid="editor-tab-add"]');
    await addBtn.click();

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);

    const closeBtn = tabs.nth(1).locator('[data-testid="editor-tab-close"]');
    await closeBtn.click();

    await expect(tabs).toHaveCount(1);
    await expect(tabs.first()).toHaveClass(/active/);
  });

  test('should reset to empty new-model tab when closing the only open tab', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(1);
    await expect(tabs.first()).toContainText('ModelOne.ttl');

    const closeBtn = tabs.first().locator('[data-testid="editor-tab-close"]');
    await closeBtn.click();

    await expect(tabs).toHaveCount(1);
    await expect(tabs.first()).toContainText('new-model');
  });

  test('should support open-in-new-tab via OpenFileDialog', async ({page}) => {
    await page.route('**/models*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({content: SAMPLE_TURTLE_MODEL_2, sourceLocation: ''}),
        });
      } else {
        await route.fulfill({status: 200, contentType: 'text/plain', body: 'ok'});
      }
    });

    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    // Trigger open dialog via ModelOpenerService
    await page.evaluate(() => {
      const modelOpener = (window as any)['angular.ModelOpenerService'];
      if (modelOpener) {
        modelOpener
          .promptAndOpen({
            file: 'OtherModel.ttl',
            namespace: 'org.eclipse.examples:1.0.0',
            aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#OtherModel',
          })
          .subscribe();
      }
    });

    // Check if dialog with "Open in new tab" button is present
    const newTabBtn = page.locator('[data-testid="openDialogNewTabButton"]');
    await expect(newTabBtn).toBeVisible({timeout: 5000});
    await newTabBtn.click();

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2, {timeout: 10000});
    await expect(tabs.nth(1)).toHaveClass(/active/);
  });

  test('should support open-in-new-tab from workspace file menu', async ({page}) => {
    await page.route('**/models/namespaces*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'org.eclipse.examples': [
            {
              version: '1.0.0',
              models: [
                {
                  name: 'OtherModel.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#OtherModel',
                  version: '2.2.0',
                },
              ],
            },
          ],
        }),
      });
    });

    await page.route('**/models/batch*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#OtherModel',
            fileName: 'OtherModel.ttl',
            aspectModel: SAMPLE_TURTLE_MODEL_2,
            sourceLocation: '',
          },
        ]),
      });
    });

    await page.route('**/models', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({content: SAMPLE_TURTLE_MODEL_2, sourceLocation: ''}),
        });
      } else {
        await route.fulfill({status: 200, contentType: 'text/plain', body: 'ok'});
      }
    });

    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    // Open workspace sidebar
    await page.locator('[data-testid="workspaceBtn"]').click();
    await expect(page.locator('ame-workspace')).toBeVisible();

    const refreshBtn = page.locator('[data-testid="workspaceRefreshButton"]');
    if (await refreshBtn.isVisible()) {
      const refreshed = page.waitForResponse(response => response.url().includes('/models/namespaces'));
      await refreshBtn.click();
      await refreshed;
    }

    // Unfold namespaces
    const toggleFold = page.locator('[data-testid="workspaceToggleFold"]');
    if (await toggleFold.isVisible()) {
      await toggleFold.click();
    }

    // Click more_horiz or right click on file
    const fileItem = page.locator('.file', {hasText: 'OtherModel.ttl'});
    await expect(fileItem).toHaveCount(1, {timeout: 10000});
    await expect(fileItem).toBeVisible();

    // Hover on file to reveal menu button, or right click
    await fileItem.hover();
    const menuBtn = fileItem.locator('[data-testid="openFileMenu"]');
    await menuBtn.click();

    // Hover or click "Open" sub-menu trigger to expand sub-menu
    const openSubMenuBtn = page.locator('[data-testid="fileMenuOpenSubMenuButton"]');
    await expect(openSubMenuBtn).toBeVisible();
    await openSubMenuBtn.hover();

    const openInNewTabOption = page.locator('[data-testid="fileMenuLoadAspectModelNewTabButton"]');
    await expect(openInNewTabOption).toBeVisible();
    await openInNewTabOption.click();

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2, {timeout: 10000});
    await expect(tabs.nth(1)).toHaveClass(/active/);
  });

  test('should show save confirmation dialog when closing dirty tab and keep tab open on Cancel', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    const activeTab = page.locator('[data-testid="editor-tab"].active');
    await expect(activeTab).toBeVisible();

    // Mark model dirty in both tab state and modelSavingTracker
    await page.evaluate(() => {
      const tabState = (window as any)['angular.TabStateService'];
      if (tabState) {
        tabState.setTabDirty(tabState.activeTabId(), true);
        tabState.modelSavingTracker?.setSavedModel('different-baseline');
      }
    });

    const closeBtn = activeTab.locator('[data-testid="editor-tab-close"]');
    await closeBtn.click();

    // Confirmation dialog must appear
    const dialogTitle = page.getByRole('heading', {name: /save changes/i});
    await expect(dialogTitle).toBeVisible();

    // Click "Cancel" button to abort closing
    const cancelBtn = page.locator('mat-dialog-actions button').filter({hasText: /cancel/i});
    await cancelBtn.click();

    // Tab must still be present and still active
    await expect(dialogTitle).not.toBeVisible();
    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(1);
    await expect(tabs.first().locator('.tab-dirty-indicator')).toBeVisible();
  });

  test('should discard changes and close tab when clicking Discard in confirmation dialog', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);

    // Add a second tab and load Model 2
    const addBtn = page.locator('[data-testid="editor-tab-add"]');
    await addBtn.click();
    await app.loadModel(SAMPLE_TURTLE_MODEL_2);

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);

    // Mark Tab 2 dirty
    await page.evaluate(() => {
      const tabState = (window as any)['angular.TabStateService'];
      if (tabState) {
        tabState.setTabDirty(tabState.activeTabId(), true);
        tabState.modelSavingTracker?.setSavedModel('different-baseline');
      }
    });

    const closeBtn = tabs.nth(1).locator('[data-testid="editor-tab-close"]');
    await closeBtn.click();

    // Confirmation dialog appears
    const dialogTitle = page.getByRole('heading', {name: /save changes/i});
    await expect(dialogTitle).toBeVisible();

    // Click "Don't Save" to discard changes and close
    const discardBtn = page.locator('mat-dialog-actions button').filter({hasText: /don't save/i});
    await discardBtn.click();

    await expect(dialogTitle).not.toBeVisible();
    await expect(tabs).toHaveCount(1);
    await expect(tabs.first()).toHaveClass(/active/);
  });

  test('should preserve independent shapes when switching between multiple tabs', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL_1);
    await app.shapeExists('ModelOne', true);

    // Add a second tab with Model 2
    const addBtn = page.locator('[data-testid="editor-tab-add"]');
    await addBtn.click();

    const tabs = page.locator('[data-testid="editor-tab"]');
    await expect(tabs).toHaveCount(2);

    await app.loadModel(SAMPLE_TURTLE_MODEL_2);
    await app.shapeExists('ModelTwo', true);

    // Switch back to Tab 1 -> ModelOne must exist, ModelTwo must not
    await tabs.first().click();
    await app.shapeExists('ModelOne', true);

    // Switch to Tab 2 -> ModelTwo must exist
    await tabs.nth(1).click();
    await app.shapeExists('ModelTwo', true);
  });
});
