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
import {SELECTOR_tbCollapseToggle} from '../../support/constants';

test.describe('Editor - Canvas Operations & Collapse/Expand', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should toggle collapse and expand on model canvas', async ({page}) => {
    const toggleBtn = page.locator(SELECTOR_tbCollapseToggle);
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
      await toggleBtn.click();
    }
  });
});
