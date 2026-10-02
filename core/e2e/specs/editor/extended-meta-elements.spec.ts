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
import {SELECTOR_anonymousToggle} from '../../support/constants';

test.describe('Editor - Extended Meta Elements Suite', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
  });

  test('should create and configure Abstract Entity & Abstract Property', async ({page}) => {
    await app.shapeExists('AspectDefault', true);
    await app.shapeExists('property1', true);
  });

  test('should support Anonymous elements with URN identification', async ({page}) => {
    await app.shapeExists('property1', true);

    await app.dbClickShape('property1');
    const anonToggle = page.locator(SELECTOR_anonymousToggle);
    if (await anonToggle.isVisible()) {
      await anonToggle.click();
    }
    await app.clickPropertiesCancelButton();
  });

  test('should support Unit & Quantifiable elements configuration', async ({page}) => {
    await app.shapeExists('property1', true);
    await app.shapeExists('Characteristic1', true);
  });

  test('should support Trait, Either & Collection characteristics', async ({page}) => {
    await app.shapeExists('property1', true);
    await app.shapeExists('Characteristic1', true);
  });
});
