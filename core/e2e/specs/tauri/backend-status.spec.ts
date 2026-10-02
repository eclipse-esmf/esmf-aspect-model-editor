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

import {Page, expect, test} from '@playwright/test';
import {setUpDefaultRoutes} from '../../support/api-mocks';
import {MockBackendStatus, TauriHelper} from '../../support/tauri-helper';

const STARTING: MockBackendStatus = {state: 'starting', port: '30001', message: null, revision: 1};
const READY: MockBackendStatus = {state: 'ready', port: '30001', message: null, revision: 2};
const FAILED: MockBackendStatus = {
  state: 'failed',
  port: '30001',
  message: 'The backend did not respond on port 30001 within 120 seconds.',
  revision: 2,
};

const overlay = (page: Page) => page.getByTestId('backend-status-overlay');

/** Returns the test id of the element the user would hit when clicking at the given viewport position. */
const hitTest = (page: Page, x: number, y: number) =>
  page.evaluate(({px, py}) => document.elementFromPoint(px, py)?.closest('[data-testid="backend-status-overlay"]') !== null, {
    px: x,
    py: y,
  });

test.describe('Backend startup status', () => {
  let tauri: TauriHelper;
  let backendRequests: string[];

  const open = async (page: Page, backendStatus: MockBackendStatus) => {
    tauri = new TauriHelper(page);
    await tauri.initTauriMock({backendStatus});
    await setUpDefaultRoutes(page);
    backendRequests = [];
    page.on('request', request => {
      if (request.url().includes('/ame/api/')) backendRequests.push(request.url());
    });
    await page.goto('/editor?e2e=true');
  };

  test('blocks the whole UI while the backend is starting', async ({page}) => {
    await open(page, STARTING);

    await expect(overlay(page)).toBeVisible();
    await expect(overlay(page)).toHaveAttribute('data-state', 'starting');
    await expect(page.getByTestId('backend-status-spinner')).toBeVisible();
    await expect(page.getByTestId('backend-status-title')).toHaveText('Starting backend...');
    await expect(overlay(page).locator('button')).toHaveCount(0);

    // Nothing of the editor is rendered and the backend is not contacted yet.
    await expect(page.locator('#graph')).toHaveCount(0);
    await expect(page.locator('ame-editor-toolbar')).toHaveCount(0);
    await page.keyboard.press('Control+p');
    await expect(page.locator('ame-files-search, ame-search-files')).toHaveCount(0);
    expect(backendRequests).toEqual([]);
  });

  test('releases the UI once the backend reports ready', async ({page}) => {
    await open(page, STARTING);
    await expect(overlay(page)).toBeVisible();

    await tauri.emitBackendStatus(READY);

    await expect(overlay(page)).toHaveCount(0);
    await expect(page.locator('#graph')).toBeVisible({timeout: 20000});
    await expect(page.locator('ame-editor-toolbar')).toBeVisible();
  });

  test('only offers retry and close when the start failed', async ({page}) => {
    await open(page, FAILED);

    await expect(overlay(page)).toHaveAttribute('data-state', 'failed');
    await expect(page.getByTestId('backend-status-title')).toHaveText('The backend could not be started');
    await expect(page.getByTestId('backend-status-message')).toHaveText(FAILED.message);
    await expect(overlay(page).locator('button')).toHaveCount(2);
    await expect(page.getByTestId('backend-status-retry')).toHaveText('Retry');
    await expect(page.getByTestId('backend-status-quit')).toHaveText('Close application');
    await expect(page.locator('#graph')).toHaveCount(0);
  });

  test('retries the backend start and continues once it is ready', async ({page}) => {
    await open(page, FAILED);

    await page.getByTestId('backend-status-retry').click();

    await expect.poll(async () => (await tauri.getSentEvents('retryBackendStart')).length).toBe(1);
    await expect(overlay(page)).toHaveAttribute('data-state', 'starting');
    await expect(page.getByTestId('backend-status-spinner')).toBeVisible();

    await tauri.emitBackendStatus({...READY, revision: 10});

    await expect(overlay(page)).toHaveCount(0);
    await expect(page.locator('#graph')).toBeVisible({timeout: 20000});
  });

  test('closes the application from the failed state', async ({page}) => {
    await open(page, FAILED);

    await page.getByTestId('backend-status-quit').click();

    await expect.poll(async () => (await tauri.getSentEvents('quitApp')).length).toBe(1);
  });

  test('covers the loaded editor without destroying it when the backend crashes', async ({page}) => {
    await open(page, READY);
    await expect(page.locator('#graph')).toBeVisible({timeout: 20000});

    await tauri.emitBackendStatus({...FAILED, message: 'The backend stopped unexpectedly (exit status: 1).', revision: 3});

    await expect(overlay(page)).toHaveAttribute('data-state', 'failed');
    await expect(page.locator('#graph')).toHaveCount(1);
    await expect(page.locator('.app-content')).toHaveAttribute('inert', '');

    const toolbar = await page.locator('ame-editor-toolbar').boundingBox();
    expect(await hitTest(page, toolbar.x + toolbar.width / 2, toolbar.y + toolbar.height / 2)).toBe(true);
  });
});
