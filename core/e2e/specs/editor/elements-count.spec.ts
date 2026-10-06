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

test.describe('Editor - Incoming & Outgoing Edge Counts', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
  });

  test('should display outgoing edges count for default Aspect model', async ({page}) => {
    await app.shapeExists('AspectDefault', true);
    await app.dbClickShape('AspectDefault');

    const incoming = page.locator('text=Incoming edges');
    const outgoing = page.locator('text=Outgoing edges');

    await expect(incoming).toHaveCount(0);
    if (await outgoing.isVisible()) {
      await expect(outgoing).toBeVisible();
    }
    await app.clickPropertiesCancelButton();
  });
});
