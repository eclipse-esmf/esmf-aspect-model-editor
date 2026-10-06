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
import {
  FIELD_descriptionen,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  SELECTOR_ecAbstractProperty,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

test.describe('Create and Edit Abstract Property', () => {
  test('should create and edit abstract property fields', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await dragElementToGraph(page, SELECTOR_ecAbstractProperty, 350, 300);
    await helper.clickShape('abstractProperty1');

    await helper.dbClickShape('abstractProperty1');
    await expect(page.locator(FIELD_name)).toBeVisible();
    await expect(page.locator(FIELD_preferredNameen)).toBeVisible();
    await expect(page.locator(FIELD_descriptionen)).toBeVisible();
    await expect(page.locator(FIELD_see)).toBeVisible();

    await page.locator(FIELD_preferredNameen).fill('New preferred Name');
    await page.locator(FIELD_descriptionen).fill('New description');
    await helper.clickSaveButton();

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:preferredName "New preferred Name"@en');
    expect(rdf).toContain('samm:description "New description"@en');
  });
});
