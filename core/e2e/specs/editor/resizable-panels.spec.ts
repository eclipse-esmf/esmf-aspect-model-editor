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
import {SELECTOR_ecProperty, SELECTOR_elementBtn, SELECTOR_workspaceBtn} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

async function width(locator: Locator): Promise<number> {
  return Math.round((await locator.boundingBox()).width);
}

async function expectWidth(locator: Locator, expected: number): Promise<void> {
  await expect.poll(() => width(locator)).toBe(expected);
}

async function dragBy(page: Page, gutter: Locator, deltaX: number): Promise<void> {
  const box = await gutter.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + deltaX / 2, y, {steps: 5});
  await page.mouse.move(x + deltaX, y, {steps: 5});
  await page.mouse.up();
}

/**
 * The handle must live inside the panel (on its resizable edge) so it never overlaps the graph,
 * and its grip must be vertically centred.
 */
async function expectHandleInsidePanel(panel: Locator, gutter: Locator, edge: 'start' | 'end'): Promise<void> {
  await expect
    .poll(async () => {
      const panelBox = await panel.boundingBox();
      const gutterBox = await gutter.boundingBox();
      const handleBox = await gutter.locator('.resize-gutter__handle').boundingBox();
      const panelRight = panelBox.x + panelBox.width;
      const gutterRight = gutterBox.x + gutterBox.width;
      const insideHorizontally = gutterBox.x >= panelBox.x - 0.5 && gutterRight <= panelRight + 0.5;
      const onEdge = edge === 'end' ? Math.abs(gutterRight - panelRight) <= 1 : Math.abs(gutterBox.x - panelBox.x) <= 1;
      const gutterCenterY = gutterBox.y + gutterBox.height / 2;
      const handleCenterY = handleBox.y + handleBox.height / 2;
      const centred = Math.abs(gutterCenterY - handleCenterY) <= 2;
      return {insideHorizontally, onEdge, centred};
    })
    .toEqual({insideHorizontally: true, onEdge: true, centred: true});
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

test.describe('Resizable panels', () => {
  test.describe('Workspace and element list', () => {
    test.beforeEach(async ({page}) => {
      await mockWorkspace(page);
      await new AppHelper(page).startModelling(false);
      await page.locator(SELECTOR_workspaceBtn).click({force: true});
      await expect(page.locator('ame-workspace-file-list')).toBeVisible();
    });

    test('workspace panel can be widened and narrowed via the gutter', async ({page}) => {
      const panel = page.locator('ame-workspace');
      const gutter = page.getByTestId('workspace-resize-gutter');
      await expect(gutter).toBeVisible();
      await expect(gutter).toHaveAttribute('role', 'separator');
      await expect(gutter.locator('mat-icon')).toHaveText('more_vert');

      await expectWidth(panel, 450);

      await dragBy(page, gutter, 150);
      await expectWidth(panel, 600);

      await dragBy(page, gutter, -200);
      await expectWidth(panel, 400);
    });

    test('workspace handle sits inside the panel edge, vertically centred', async ({page}) => {
      const panel = page.locator('ame-workspace');
      const gutter = page.getByTestId('workspace-resize-gutter');
      await expectHandleInsidePanel(panel, gutter, 'end');
      await expect(gutter).toHaveCSS('cursor', 'ew-resize');

      await dragBy(page, gutter, 120);
      await expectHandleInsidePanel(panel, gutter, 'end');
    });

    test('workspace handle highlights on hover', async ({page}) => {
      const gutter = page.getByTestId('workspace-resize-gutter');
      const line = gutter.locator('.resize-gutter__indication-line');
      await page.mouse.move(700, 400);
      await expect(line).toHaveCSS('opacity', '0');
      await gutter.hover();
      await expect.poll(async () => Number(await line.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0.9);
    });

    test('workspace panel respects its minimum width', async ({page}) => {
      const panel = page.locator('ame-workspace');
      await dragBy(page, page.getByTestId('workspace-resize-gutter'), -400);
      await expectWidth(panel, 280);
    });

    test('workspace width is persisted across reloads and reset by double click', async ({page}) => {
      const panel = page.locator('ame-workspace');
      const gutter = page.getByTestId('workspace-resize-gutter');
      await dragBy(page, gutter, 100);
      await expectWidth(panel, 550);
      expect(await page.evaluate(() => localStorage.getItem('ame.sidebar.workspace.width'))).toBe('550');

      await page.reload();
      await page.locator(SELECTOR_workspaceBtn).click({force: true});
      await expect(page.locator('ame-workspace-file-list')).toBeVisible();
      await expectWidth(panel, 550);

      await page.getByTestId('workspace-resize-gutter').dblclick();
      await expectWidth(panel, 450);
      expect(await page.evaluate(() => localStorage.getItem('ame.sidebar.workspace.width'))).toBeNull();
    });

    test('workspace gutter can be used with the keyboard', async ({page}) => {
      const panel = page.locator('ame-workspace');
      await page.getByTestId('workspace-resize-gutter').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await expectWidth(panel, 482);
      await page.keyboard.press('ArrowLeft');
      await expectWidth(panel, 466);
    });

    test('element list follows the workspace width and is resizable itself', async ({page}) => {
      await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).click();
      const elements = page.locator('ame-workspace-file-elements');
      await expect(elements).toBeVisible();

      const workspace = page.locator('ame-workspace');
      const workspaceBox = await workspace.boundingBox();
      expect(Math.round((await elements.boundingBox()).x)).toBe(Math.round(workspaceBox.x + workspaceBox.width));
      await expectWidth(elements, 350);

      await dragBy(page, page.getByTestId('workspace-resize-gutter'), 100);
      await expectWidth(workspace, 550);
      const movedBox = await workspace.boundingBox();
      await expect.poll(async () => Math.round((await elements.boundingBox()).x)).toBe(Math.round(movedBox.x + movedBox.width));

      await expectHandleInsidePanel(elements, page.getByTestId('file-elements-resize-gutter'), 'end');
      await dragBy(page, page.getByTestId('file-elements-resize-gutter'), 120);
      await expectWidth(elements, 470);
      expect(await page.evaluate(() => localStorage.getItem('ame.sidebar.fileElements.width'))).toBe('470');
    });

    test('panel widths never exceed the window on small screens', async ({page}) => {
      await page.setViewportSize({width: 800, height: 600});
      const panel = page.locator('ame-workspace');
      await dragBy(page, page.getByTestId('workspace-resize-gutter'), 1000);
      await expectWidth(panel, 680);
      const box = await panel.boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(800);
    });
  });

  test('SAMM elements panel can be resized and keeps its width', async ({page}) => {
    const app = new AppHelper(page);
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await page.locator(SELECTOR_elementBtn).click();
    await expect(page.locator(SELECTOR_ecProperty)).toBeVisible();

    const panel = page.locator('ame-sidebar-samm-elements');
    const gutter = page.getByTestId('samm-elements-resize-gutter');
    await expectHandleInsidePanel(panel, gutter, 'end');
    const initial = await width(panel);

    await dragBy(page, gutter, 120);
    await expectWidth(panel, initial + 120);

    await dragBy(page, gutter, -1000);
    await expectWidth(panel, 250);
    await expect(page.locator(SELECTOR_ecProperty)).toBeVisible();

    await page.reload();
    await page.locator(SELECTOR_elementBtn).click();
    await expectWidth(panel, 250);
  });

  test('edit view is resized via the shared gutter', async ({page}) => {
    const app = new AppHelper(page);
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await app.dbClickShape('property1');

    const section = page.locator('.info-section');
    const gutter = page.getByTestId('info-section-drag');
    await expect(gutter).toBeVisible();
    await expect(section).toBeVisible();
    await expectWidth(section, 480);
    await expectHandleInsidePanel(section, gutter, 'start');

    await dragBy(page, gutter, -200);
    await expectWidth(section, 680);

    await dragBy(page, gutter, 600);
    await expectWidth(section, 480);
    expect(await page.evaluate(() => localStorage.getItem('ame.editView.width'))).toBe('480');
  });

  test('edit view gutter does not hide the graph area next to the panel', async ({page}) => {
    const app = new AppHelper(page);
    await app.visitDefault();
    await app.loadModel(readFixture('default-models/aspect-default.txt'));
    await app.dbClickShape('property1');

    const section = page.locator('.info-section');
    const gutter = page.getByTestId('info-section-drag');
    await expect(gutter).toBeVisible();
    const sectionBox = await section.boundingBox();
    // The point just left of the panel belongs to the graph, not to the gutter.
    const hit = await page.evaluate(({x, y}) => !!document.elementFromPoint(x, y)?.closest('ame-resize-gutter'), {
      x: sectionBox.x - 3,
      y: sectionBox.y + sectionBox.height / 2,
    });
    expect(hit).toBe(false);
  });
});
