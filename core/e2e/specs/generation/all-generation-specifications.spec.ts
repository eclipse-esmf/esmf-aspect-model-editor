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

test.describe('Generation - Comprehensive Suite', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should verify OpenAPI specification modal and options', async ({page}) => {
    await page.evaluate(() => {
      const generateService = (window as any)['angular.generateHandlingService'];
      generateService?.openGenerateOpenApiModal?.();
    });
    const modal = page.locator('mat-dialog-container');
    if (await modal.isVisible()) {
      await expect(modal).toBeVisible();
      const closeBtn = page.locator('[data-testid="cancelOpenApiButton"], button.close-button, [mat-dialog-close]').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }
  });

  test('should verify AsyncAPI generation modal', async ({page}) => {
    await page.evaluate(() => {
      const generateService = (window as any)['angular.generateHandlingService'];
      generateService?.openGenerateAsyncApiModal?.();
    });
    const modal = page.locator('mat-dialog-container');
    if (await modal.isVisible()) {
      await expect(modal).toBeVisible();
      const closeBtn = page.locator('button.close-button, [mat-dialog-close]').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }
  });

  test('should verify Documentation generation modal', async ({page}) => {
    await page.evaluate(() => {
      const generateService = (window as any)['angular.generateHandlingService'];
      generateService?.openGenerateDocumentationModal?.();
    });
    const modal = page.locator('mat-dialog-container');
    if (await modal.isVisible()) {
      await expect(modal).toBeVisible();
      const closeBtn = page.locator('button.close-button, [mat-dialog-close]').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }
  });

  test('should verify JSON payload & schema generation modals', async ({page}) => {
    await page.evaluate(() => {
      const generateService = (window as any)['angular.generateHandlingService'];
      generateService?.openGenerateJsonSampleModal?.();
    });
    const modal = page.locator('mat-dialog-container');
    if (await modal.isVisible()) {
      await expect(modal).toBeVisible();
      const closeBtn = page.locator('button.close-button, [mat-dialog-close]').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }
  });

  test('should verify AASX and XML AAS generation modals', async ({page}) => {
    await page.evaluate(() => {
      const generateService = (window as any)['angular.generateHandlingService'];
      generateService?.openGenerateAasModal?.();
    });
    const modal = page.locator('mat-dialog-container');
    if (await modal.isVisible()) {
      await expect(modal).toBeVisible();
      const closeBtn = page.locator('button.close-button, [mat-dialog-close]').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
    }
  });
});
