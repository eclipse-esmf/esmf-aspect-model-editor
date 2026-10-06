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
import {FIELD_name} from '../../support/constants';

test.describe('Editor - Aspect Editing & Property Configuration', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('should verify default aspect existence and open editor modal', async ({page}) => {
    await app.shapeExists('AspectDefault', true);
    await app.dbClickShape('AspectDefault');

    const nameInput = page.locator(FIELD_name);
    await expect(nameInput).toBeVisible();
    await app.clickPropertiesCancelButton();
  });

  test('should rename aspect and verify updated model', async ({page}) => {
    await app.shapeExists('AspectDefault', true);
    await app.renameElement('AspectDefault', 'NewAspect');
    await app.shapeExists('NewAspect', true);

    const aspect = await app.getAspect();
    expect(aspect?.name).toBe('NewAspect');

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':NewAspect');
    expect(rdf).toContain(':NewAspect a samm:Aspect');
  });

  test('should add property to aspect and update RDF structure', async ({page}) => {
    await app.shapeExists('AspectDefault', true);
    await app.clickAddShapePlusIcon('AspectDefault');

    // Wait for property to appear
    await app.shapeExists('property1', true);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm:properties');
  });
});
