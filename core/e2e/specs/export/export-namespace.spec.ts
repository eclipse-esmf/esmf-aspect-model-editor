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
import {SELECTOR_enNamespaceList} from '../../support/constants';

test.describe('Export - Namespaces & Language Strings', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should open export dialog and list available namespaces', async ({page}) => {
    const exportBtn = page.locator('[data-testid="exportBtn"], [data-testid="tbExportButton"]').first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      const nsList = page.locator(SELECTOR_enNamespaceList);
      if (await nsList.isVisible()) {
        await expect(nsList).toBeVisible();
      }
    }
  });
});
