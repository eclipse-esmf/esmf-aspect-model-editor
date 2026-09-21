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
import {FIELD_name, SELECTOR_elementBtn} from '../../support/constants';

test.describe('Editor - Entity & Property Editing', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
  });

  test('should rename Property and verify RDF output', async ({page}) => {
    await app.shapeExists('property1', true);

    await app.dbClickShape('property1');
    const nameField = page.locator(FIELD_name);
    await expect(nameField).toBeVisible();
    await nameField.fill('testProperty');
    await app.clickSaveButton();

    await app.shapeExists('testProperty', true);
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':testProperty a samm:Property');
  });

  test('should verify Characteristic on Property', async ({page}) => {
    await app.shapeExists('property1', true);
    await app.shapeExists('Characteristic1', true);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm:characteristic :Characteristic1');
    expect(rdf).toContain(':Characteristic1 a samm:Characteristic');
  });
});
