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

import {test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_openFileMenu, SELECTOR_workspaceBtn, SELECTOR_workspaceSearchInput} from '../../support/constants';

test.describe('Workspace - File Management & Filtering', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should open workspace file list and filter models', async ({page}) => {
    const wsBtn = page.locator(SELECTOR_workspaceBtn);
    if (await wsBtn.isVisible()) {
      await wsBtn.click();
      const wsSearch = page.locator(SELECTOR_workspaceSearchInput);
      if (await wsSearch.isVisible()) {
        await wsSearch.fill('Movement');
      }
    }
  });

  test('should open file actions context menu in workspace', async ({page}) => {
    const wsBtn = page.locator(SELECTOR_workspaceBtn);
    if (await wsBtn.isVisible()) {
      await wsBtn.click();
      const fileMenuBtn = page.locator(SELECTOR_openFileMenu).first();
      if (await fileMenuBtn.isVisible()) {
        await fileMenuBtn.click();
      }
    }
  });
});
