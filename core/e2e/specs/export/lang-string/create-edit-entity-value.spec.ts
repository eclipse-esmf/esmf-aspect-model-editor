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
import {AppHelper} from '../../../support/app-helper';
import {
  FIELD_characteristicName,
  FIELD_clearDataTypeBtn,
  FIELD_dataType,
  FIELD_dataTypeOption,
  FIELD_entityValueName,
  FIELD_propertyLanguageValue,
  FIELD_propertyValueComplex,
  FIELD_propertyValueNotComplex,
  SELECTOR_addEntityValue,
  SELECTOR_clearEntityValueButton,
  SELECTOR_clearLanguageButton,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_entitySaveButton,
} from '../../../support/constants';
import {readFixture} from '../../../support/drag-drop-utils';

async function verifyColumnValues(page: any, dataCy: string, expectedKeyValues: Array<{key: string; value: string}>) {
  for (let i = 0; i < expectedKeyValues.length; i++) {
    const item = expectedKeyValues[i];
    const row = page.locator(`[data-testid="${dataCy}"]`);
    await expect(row.locator('.cdk-column-key').nth(i)).toContainText(item.key);
    await expect(row.locator('.cdk-column-value').nth(i)).toContainText(item.value);
  }
}

test.describe('Create and edit Entity value RDF lang string properties in edit view tests', () => {
  test('should change entity values with rdf lang string property on Collection', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_clearDataTypeBtn).click();
    await page.locator(FIELD_dataType).fill('NewEntity');
    await page.locator('.mat-mdc-option').filter({hasText: 'NewEntity'}).click();
    await helper.clickSaveButton();

    await helper.shapeExists('NewEntity');
    await helper.clickAddShapePlusIcon('NewEntity');
    await helper.clickAddShapePlusIcon('NewEntity');
    await helper.clickAddShapePlusIcon('NewEntity');
    await helper.clickAddShapePlusIcon('Characteristic2');

    await helper.dbClickShape('Characteristic4');
    await page.locator('button[data-testid="clear-dataType-button"]').click({force: true});
    await page.locator(FIELD_dataType).fill('langString');
    await page.locator(FIELD_dataTypeOption).nth(0).click();
    await helper.clickSaveButton();

    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option').filter({hasText: 'Enumeration'}).click();

    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('ev1');
    await page.locator(FIELD_propertyValueComplex).nth(0).fill('ev2');
    await page.locator('.mat-mdc-option').filter({hasText: 'ev2'}).click();
    await page.locator(FIELD_propertyValueNotComplex).nth(0).fill('ev3');
    await page.locator(FIELD_propertyValueNotComplex).nth(1).fill('ev4');
    await page.locator(FIELD_propertyLanguageValue).fill('de');
    await page.locator('.mat-mdc-option').filter({hasText: 'de'}).first().click();

    await page.locator(SELECTOR_entitySaveButton).click();
    await helper.clickSaveButton();

    await helper.dbClickShape('ev1');
    await expect(page.locator(FIELD_propertyValueComplex).nth(0)).toHaveValue('ev2');
    await expect(page.locator(FIELD_propertyValueNotComplex).nth(0)).toHaveValue('ev3');
    await expect(page.locator(FIELD_propertyValueNotComplex).nth(1)).toHaveValue('ev4');
    await expect(page.locator(FIELD_propertyLanguageValue)).toHaveValue('de');

    await page.locator(SELECTOR_clearEntityValueButton).click();
    await page.locator(FIELD_propertyValueComplex).nth(0).fill('ev5');
    await page.locator('.mat-mdc-option').filter({hasText: 'ev5'}).first().click();
    await page.locator(FIELD_propertyValueNotComplex).nth(0).fill('ev6');
    await page.locator(FIELD_propertyValueNotComplex).nth(1).fill('ev7');
    await page.locator(SELECTOR_clearLanguageButton).click();
    await page.locator(FIELD_propertyLanguageValue).fill('en');
    await page.locator('.mat-mdc-option').filter({hasText: 'en'}).first().click();
    await page.locator(SELECTOR_editorSaveButton).click();

    await helper.dbClickShape('Characteristic1');
    await verifyColumnValues(page, 'ev1', [
      {key: 'Property', value: 'Value'},
      {key: 'property2', value: 'ev5'},
      {key: 'property3', value: 'ev6'},
      {key: 'property4  (en)', value: 'ev7'},
    ]);

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':ev5 a :Entity1;');
    expect(rdf).toContain(':ev1 a :NewEntity;');
    expect(rdf).toContain(':property2 :ev5;');
    expect(rdf).toContain(':property3 "ev6";');
    expect(rdf).toContain(':property4 "ev7"@en.');
    expect(rdf).toContain(':Characteristic2 a samm:Characteristic;');
    expect(rdf).toContain(':Characteristic3 a samm:Characteristic;');
    expect(rdf).toContain(':Characteristic4 a samm:Characteristic;');
  });
});
