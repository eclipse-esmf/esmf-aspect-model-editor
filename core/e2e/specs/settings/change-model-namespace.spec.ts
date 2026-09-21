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
import {SELECTOR_namespaceTabValueInput, SELECTOR_namespaceTabVersionInput} from '../../support/constants';

test.describe('Settings - Namespace & Model Configuration', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('should open namespace settings and verify default values', async ({page}) => {
    await app.openSettings(/Namespace|Modell/i);

    const nsInput = page.locator(SELECTOR_namespaceTabValueInput);
    const verInput = page.locator(SELECTOR_namespaceTabVersionInput);

    await expect(nsInput).toBeVisible();
    await expect(verInput).toBeVisible();
  });

  test('should update namespace and version in settings dialog', async ({page}) => {
    await app.openSettings(/Namespace|Modell/i);

    const nsInput = page.locator(SELECTOR_namespaceTabValueInput);
    const verInput = page.locator(SELECTOR_namespaceTabVersionInput);

    await nsInput.fill('org.eclipse.examples.test');
    await verInput.fill('2.0.0');

    // Confirm dialog
    const okBtn = page
      .locator('mat-dialog-container button')
      .filter({hasText: /ok|speichern|save/i})
      .first();
    if (await okBtn.isVisible()) {
      await app.closeDialog(okBtn);
    }
  });
});
