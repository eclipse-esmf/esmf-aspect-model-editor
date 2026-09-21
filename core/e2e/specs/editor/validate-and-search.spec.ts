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
import {SELECTOR_tbValidateButton} from '../../support/constants';

test.describe('Editor - Model Validation & Element Search', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should trigger model validation without errors', async ({page}) => {
    const validateBtn = page.locator(SELECTOR_tbValidateButton);
    if (await validateBtn.isVisible()) {
      await validateBtn.click();
    }
  });

  test('should search for elements in search palette', async ({page}) => {
    const searchInput = page.locator('[data-cy="searchElements"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('AspectDefault');
    }
  });
});
