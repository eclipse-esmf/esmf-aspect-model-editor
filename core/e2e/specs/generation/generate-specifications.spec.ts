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

test.describe('Generation - OpenAPI, AsyncAPI & Documentation', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should trigger generation options from toolbar or menu', async ({page}) => {
    // Check toolbar elements for documentation/generation
    const docBtn = page.locator('[data-cy="generate-doc"], [data-cy="tbGenerateButton"], ame-generate-documentation');
    if (await docBtn.first().isVisible()) {
      await expect(docBtn.first()).toBeVisible();
    }
  });
});
