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
  FIELD_characteristicName,
  FIELD_descriptionen,
  FIELD_preferredNameen,
  FIELD_unit,
  SELECTOR_editorSaveButton,
} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test migration of common attributes on Constraint/Characteristic type change', () => {
  test('migrates preferredName, description, see and units across class types', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await helper.shapeExists('Characteristic1');
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_preferredNameen).fill('testPreferredName');
    await page.locator(FIELD_descriptionen).fill('testDescription');
    await page.locator(SELECTOR_editorSaveButton).click({force: true});

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:preferredName "testPreferredName"@en');
    expect(rdf).toContain('samm:description "testDescription"@en');

    // Change to Code
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Code"]').click();
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Characteristic1 a samm-c:Code');
    expect(rdf).toContain('samm:preferredName "testPreferredName"@en');
    expect(rdf).toContain('samm:description "testDescription"@en');

    // Change to Duration
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Duration"]').click();
    await page.locator(FIELD_unit).fill('day');
    await page.locator('mat-optgroup[label="Predefined Units"] mat-option').getByText('day', {exact: true}).click();
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Characteristic1 a samm-c:Duration');
    expect(rdf).toContain('samm-c:unit unit:day');
  });
});
