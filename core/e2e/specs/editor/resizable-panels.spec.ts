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

/** Offset between the centre of the grip icon and the centre of its handle (x, y) in px. */
async function iconOffset(gutter: Locator): Promise<{dx: number; dy: number}> {
  return gutter.evaluate(element => {
    const handle = element.querySelector('.resize-gutter__handle').getBoundingClientRect();
    const icon = element.querySelector('.resize-gutter__icon').getBoundingClientRect();
    return {
      dx: Math.abs(icon.left + icon.width / 2 - (handle.left + handle.width / 2)),
      dy: Math.abs(icon.top + icon.height / 2 - (handle.top + handle.height / 2)),
    };
  });
}

async function expectIconCentred(gutter: Locator): Promise<void> {
  await expect.poll(async () => (await iconOffset(gutter)).dx, {message: 'icon horizontally centred'}).toBeLessThanOrEqual(1);
  await expect.poll(async () => (await iconOffset(gutter)).dy, {message: 'icon vertically centred'}).toBeLessThanOrEqual(1);
}

async function backgroundOf(locator: Locator): Promise<string> {
  return locator.evaluate(element => getComputedStyle(element).backgroundColor);
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
              {
                name: 'OtherModel.ttl',
                model: 'OtherModel.ttl',
                aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#OtherModel',
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
        {
          aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#OtherModel',
          aspectModel: readFixture('default-models/aspect-default.txt'),
          absoluteName: 'org.eclipse.examples.aspect:1.0.0:OtherModel.ttl',
          fileName: 'OtherModel.ttl',
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

    test('grip icon is centred in its handle and stays centred after resizing', async ({page}) => {
      const gutter = page.getByTestId('workspace-resize-gutter');
      await expectIconCentred(gutter);
      await dragBy(page, gutter, 80);
      await expectIconCentred(gutter);

      await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).click();
      await expectIconCentred(page.getByTestId('file-elements-resize-gutter'));
    });

    test('grip icon is not clipped by its handle', async ({page}) => {
      const clipped = await page.getByTestId('workspace-resize-gutter').evaluate(element => {
        const handle = element.querySelector('.resize-gutter__handle').getBoundingClientRect();
        const icon = element.querySelector('.resize-gutter__icon').getBoundingClientRect();
        return icon.height > handle.height + 0.5 || icon.width <= 0;
      });
      expect(clipped).toBe(false);
    });

    test.describe('workspace and element list side by side', () => {
      test.beforeEach(async ({page}) => {
        await page.getByRole('button', {name: 'Select file SampleModel.ttl'}).click();
        await expect(page.locator('ame-workspace-file-elements')).toBeVisible();
      });

      test('the element list has its own tinted background and an accent edge', async ({page}) => {
        const elements = page.locator('ame-workspace-file-elements');
        const workspace = page.locator('ame-workspace');

        expect(await backgroundOf(elements)).not.toBe(await backgroundOf(workspace));
        await expect(elements).toHaveCSS('border-left-style', 'solid');
        await expect(elements).toHaveCSS('border-left-width', '4px');
      });

      test('the element list header names the panel, the file and the namespace', async ({page}) => {
        const header = page.getByTestId('file-elements-header');
        await expect(header).toContainText(/element list|elementliste/i);
        await expect(header.locator('h2')).toHaveText('SampleModel.ttl');
        await expect(page.getByTestId('file-elements-namespace')).toHaveText('org.eclipse.examples.aspect:1.0.0');
      });

      test('the selected workspace file is visually linked to the element list', async ({page}) => {
        const row = page.getByTestId('workspace-file-SampleModel.ttl');
        await expect(row).toHaveClass(/selected--linked/);
        await expect(row).toHaveCSS('font-weight', '500');
        // The former arrow next to the selected file is gone; the highlight alone marks the link.
        const arrow = await row.evaluate(element => getComputedStyle(element, '::after').content);
        expect(['none', 'normal', '']).toContain(arrow);

        const [rowBox, workspaceBox] = await Promise.all([row.boundingBox(), page.locator('ame-workspace').boundingBox()]);
        expect(rowBox.x + rowBox.width).toBeLessThanOrEqual(workspaceBox.x + workspaceBox.width + 1);
      });

      test('the file menu (three dots) is always visible: subtle by default, fully on hover and on the selected row', async ({page}) => {
        await page.mouse.move(900, 500);
        const selectedMenu = page.getByTestId('workspace-file-SampleModel.ttl').locator('[data-testid="openFileMenu"]');
        await expect(selectedMenu).toBeVisible();
        await expect.poll(async () => Number(await selectedMenu.evaluate(el => getComputedStyle(el).opacity))).toBe(1);

        const otherRow = page.getByTestId('workspace-file-OtherModel.ttl');
        const otherMenu = otherRow.locator('[data-testid="openFileMenu"]');
        await expect(otherMenu).toBeVisible();
        await expect.poll(async () => Number(await otherMenu.evaluate(el => getComputedStyle(el).opacity))).toBeLessThan(0.6);
        await expect.poll(async () => Number(await otherMenu.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0.2);

        await otherRow.hover();
        await expect.poll(async () => Number(await otherMenu.evaluate(el => getComputedStyle(el).opacity))).toBe(1);
      });

      test('the file menu can be opened with the keyboard without hovering', async ({page}) => {
        await page.mouse.move(900, 500);
        const otherMenu = page.getByTestId('workspace-file-OtherModel.ttl').locator('[data-testid="openFileMenu"]');
        await otherMenu.focus();
        await expect.poll(async () => Number(await otherMenu.evaluate(el => getComputedStyle(el).opacity))).toBe(1);
        await page.keyboard.press('Enter');
        await expect(page.locator('.mat-mdc-menu-panel')).toBeVisible();
        await page.keyboard.press('Escape');
      });

      test('closing the element list removes the link and the panel', async ({page}) => {
        await page.getByTestId('file-elements-close').click();

        await expect(page.locator('ame-workspace-file-elements')).toHaveCount(0);
        await expect(page.getByTestId('workspace-file-SampleModel.ttl')).not.toHaveClass(/selected--linked/);
      });

      test('the element list close button explains itself', async ({page}) => {
        const close = page.getByTestId('file-elements-close');
        await expect(close).toHaveAttribute('aria-label', /close|schließen/i);
      });

      test('the distinction also works in dark mode', async ({page}) => {
        await page.getByTestId('darkModeBtn').click();
        await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark-theme'))).toBe(true);
        const elements = page.locator('ame-workspace-file-elements');
        expect(await backgroundOf(elements)).not.toBe(await backgroundOf(page.locator('ame-workspace')));
        await expect(elements).toHaveCSS('border-left-width', '4px');
      });
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

    await expectIconCentred(gutter);
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
