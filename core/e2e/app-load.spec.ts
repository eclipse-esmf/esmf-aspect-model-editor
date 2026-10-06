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
import {AppHelper} from './support/app-helper';

test.describe('Aspect Model Editor - App Initialization', () => {
  test('should load the application and show main navigation/toolbar', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    // Verify main editor canvas container
    await expect(page.locator('#graph')).toBeVisible();
    await expect(page.locator('ame-editor-toolbar')).toBeVisible();
  });

  test('should display canvas container', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await expect(page.locator('#graph')).toBeVisible();
  });
});
