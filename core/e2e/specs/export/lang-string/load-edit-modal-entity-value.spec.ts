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

import {expect, Locator, Page, test} from '@playwright/test';
import {AppHelper} from '../../../support/app-helper';
import {
  FIELD_entityValueName,
  FIELD_propertyLanguageValue,
  FIELD_propertyValueNotComplex,
  SELECTOR_addEntityValue,
  SELECTOR_editorSaveButton,
  SELECTOR_entitySaveButton,
} from '../../../support/constants';
import {readFixture} from '../../../support/drag-drop-utils';

async function setLanguage(page: Page, inputLocator: Locator, lang: string) {
  await inputLocator.click();
  await inputLocator.fill('');
  await inputLocator.pressSequentially(lang, {delay: 30});
  const option = page
    .locator('.mat-mdc-option')
    .filter({hasText: new RegExp(`^\\s*${lang}\\s*$`)})
    .first();
  await option.waitFor({state: 'visible'});
  await option.click();
}

async function verifyColumnValues(page: any, dataCy: string, expectedKeyValues: Array<{key: string; value: string}>) {
  for (let i = 0; i < expectedKeyValues.length; i++) {
    const item = expectedKeyValues[i];
    const row = page.locator(`[data-testid="${dataCy}"]`);
    await expect(row.locator('.cdk-column-key').nth(i)).toContainText(item.key);
    await expect(row.locator('.cdk-column-value').nth(i)).toContainText(item.value);
  }
}

test.describe('Loading and edit Entity value RDF lang string properties on modal tests', () => {
  test('should add entity value with rdf lang string property into collection', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfModel = readFixture('entity-value/validFileText');
    await helper.loadModel(rdfModel);

    await helper.dbClickShape('Enumeration');
    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('Complaint30');
    await page.locator(FIELD_propertyValueNotComplex).nth(0).fill('30');
    await page.locator(FIELD_propertyValueNotComplex).nth(1).fill('DescriptionOne');

    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(0), 'de');

    await page.locator('[data-testid="modeDescriptionAdd"]').click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(4);
    await page.locator(FIELD_propertyValueNotComplex).nth(2).fill('DescriptionTwo');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(1), 'en');

    await page.locator('[data-testid="modeDescriptionAdd"]').click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(5);
    await page.locator(FIELD_propertyValueNotComplex).nth(3).fill('DescriptionThree');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(2), 'en');

    await page.locator('[data-testid="modeDescriptionRemove"]').nth(0).click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(4);
    await page.locator(FIELD_propertyValueNotComplex).nth(3).fill('Value');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(2), 'en');

    await page.locator(SELECTOR_entitySaveButton).click();

    await verifyColumnValues(page, 'Complaint10', [
      {key: 'Property', value: 'Value'},
      {key: 'modeCode', value: '10'},
      {key: 'modeDescription  (de)', value: 'Test'},
      {key: 'modeDescription  (en)', value: 'Test'},
      {key: 'modeValue  (de)', value: 'Test'},
    ]);
    await verifyColumnValues(page, 'Complaint20', [
      {key: 'Property', value: 'Value'},
      {key: 'modeCode', value: '20'},
      {key: 'modeDescription  (de)', value: 'Test'},
      {key: 'modeDescription  (en)', value: 'Test'},
      {key: 'modeValue  (de)', value: 'Test'},
    ]);
    await verifyColumnValues(page, 'Complaint30', [
      {key: 'Property', value: 'Value'},
      {key: 'modeCode', value: '30'},
      {key: 'modeDescription  (de)', value: 'DescriptionOne'},
      {key: 'modeDescription  (en)', value: 'DescriptionThree'},
      {key: 'modeValue  (en)', value: 'Value'},
    ]);

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Complaint10 a :Mode;');
    expect(rdf).toContain(':modeCode "10"^^xsd:positiveInteger;');
    expect(rdf).toContain(':modeDescription "Test"@de, "Test"@en;');
    expect(rdf).toContain(':ModeDescription a samm-c:Collection;');
    expect(rdf).toContain('ModeValue a samm:Characteristic');
    expect(rdf).toContain(':modeValue "Test"@de');

    await page.locator(SELECTOR_editorSaveButton).click();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Complaint30 a :Mode;');
    expect(rdf).toContain(':modeCode "30"^^xsd:positiveInteger;');
    expect(rdf).toContain(':modeDescription "DescriptionOne"@de, "DescriptionThree"@en;');
    expect(rdf).toContain(':ModeDescription a samm-c:Collection;');
    expect(rdf).toContain('ModeValue a samm:Characteristic');
    expect(rdf).toContain(':modeValue "Value"@en');
  });

  test('should add entity values with rdf lang string into two different collections', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfModel = readFixture('entity-value/twoCollectionSet');
    await helper.loadModel(rdfModel);

    await helper.dbClickShape('Enumeration');
    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('Complaint30');
    await page.locator(FIELD_propertyValueNotComplex).nth(0).fill('30');
    await page.locator(FIELD_propertyValueNotComplex).nth(1).fill('DescriptionOne');

    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(0), 'de');

    await page.locator('[data-testid="modeDescriptionAdd"]').click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(4);
    await page.locator(FIELD_propertyValueNotComplex).nth(2).fill('DescriptionTwo');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(1), 'en');

    await page.locator('[data-testid="modeDescriptionAdd"]').click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(5);
    await page.locator(FIELD_propertyValueNotComplex).nth(3).fill('DescriptionThree');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(2), 'en');

    await page.locator('[data-testid="modeDescriptionRemove"]').nth(0).click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(4);
    await page.locator(FIELD_propertyValueNotComplex).nth(3).fill('ValueOne');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(2), 'en');

    await page.locator('[data-testid="modeValueAdd"]').click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(5);
    await page.locator(FIELD_propertyValueNotComplex).nth(4).fill('ValueTwo');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(3), 'de');

    await page.locator('[data-testid="modeValueAdd"]').click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(6);
    await page.locator(FIELD_propertyValueNotComplex).nth(5).fill('ValueThree');
    await setLanguage(page, page.locator(FIELD_propertyLanguageValue).nth(4), 'de');

    await page.locator('[data-testid="modeValueRemove"]').nth(0).click();
    await expect(page.locator(FIELD_propertyValueNotComplex)).toHaveCount(5);
    await page.locator(SELECTOR_entitySaveButton).click();

    await verifyColumnValues(page, 'Complaint10', [
      {key: 'Property', value: 'Value'},
      {key: 'modeCode', value: '10'},
      {key: 'modeDescription  (de)', value: 'Test'},
      {key: 'modeDescription  (en)', value: 'Test'},
      {key: 'modeValue  (de)', value: 'Test'},
      {key: 'modeValue  (en)', value: 'Test'},
    ]);
    await verifyColumnValues(page, 'Complaint20', [
      {key: 'Property', value: 'Value'},
      {key: 'modeCode', value: '20'},
      {key: 'modeDescription  (de)', value: 'Test'},
      {key: 'modeDescription  (en)', value: 'Test'},
      {key: 'modeValue  (de)', value: 'Test'},
      {key: 'modeValue  (en)', value: 'Test'},
    ]);
    await verifyColumnValues(page, 'Complaint30', [
      {key: 'Property', value: 'Value'},
      {key: 'modeCode', value: '30'},
      {key: 'modeDescription  (de)', value: 'DescriptionOne'},
      {key: 'modeDescription  (en)', value: 'DescriptionThree'},
      {key: 'modeValue  (en)', value: 'ValueOne'},
      {key: 'modeValue  (de)', value: 'ValueThree'},
    ]);

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Complaint10 a :Mode;');
    expect(rdf).toContain(':modeCode "10"^^xsd:positiveInteger;');
    expect(rdf).toContain(':ModeDescription a samm-c:Collection;');
    expect(rdf).toContain(':modeDescription "Test"@de, "Test"@en;');
    expect(rdf).toContain(':ModeValue a samm-c:Collection');
    expect(rdf).toContain(':modeValue "Test"@de, "Test"@en');

    await page.locator(SELECTOR_editorSaveButton).click();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Complaint30 a :Mode;');
    expect(rdf).toContain(':ModeDescription a samm-c:Collection;');
    expect(rdf).toContain(':modeDescription "DescriptionOne"@de, "DescriptionThree"@en;');
    expect(rdf).toContain(':ModeValue a samm-c:Collection');
    expect(rdf).toContain(':modeValue "ValueOne"@en, "ValueThree"@de');
  });
});
