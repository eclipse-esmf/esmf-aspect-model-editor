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
import {SELECTOR_ecProperty, SELECTOR_elementBtn} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

const SAMM_DOCS_URL = /^https:\/\/eclipse-esmf\.github\.io\/samm-specification\/\d+\.\d+\.\d+\/meta-model-elements\.html$/;

test.describe('SAMM elements sidebar', () => {
  test.beforeEach(async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.loadModel(readFixture('default-models/aspect-default.txt'));
    await page.locator(SELECTOR_elementBtn).click();
    await expect(page.locator(SELECTOR_ecProperty)).toBeVisible();
  });

  test('shows a link to the version specific SAMM documentation', async ({page}) => {
    const link = page.getByTestId('samm-elements-docs-link');

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', SAMM_DOCS_URL);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('aria-label', /SAMM \d+\.\d+\.\d+ documentation/);

    await link.hover();
    await expect(page.locator('.mat-mdc-tooltip-show')).toContainText(/Open the SAMM \d+\.\d+\.\d+ documentation/);
  });

  test('makes the whole "SAMM Elements" title clickable', async ({page}) => {
    const link = page.getByTestId('samm-elements-docs-link');

    await expect(link.locator('h2')).toHaveText('SAMM Elements');
    await expect(link.locator('mat-icon')).toHaveText('info_outline');
  });

  test('opens the documentation in exactly one new browser tab', async ({page, context}) => {
    await context.route('https://eclipse-esmf.github.io/**', route => route.fulfill({status: 200, contentType: 'text/html', body: 'SAMM'}));

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByTestId('samm-elements-docs-link').getByText('SAMM Elements').click(),
    ]);

    await expect(popup).toHaveURL(SAMM_DOCS_URL);
    await page.waitForTimeout(500);
    expect(context.pages()).toHaveLength(2);
    await popup.close();
  });

  test('does not show element descriptions', async ({page}) => {
    await expect(page.locator('ame-sidebar-samm-elements .element-description')).toHaveCount(0);
  });
});
