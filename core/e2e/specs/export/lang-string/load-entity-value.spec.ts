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
import {SELECTOR_editorCancelButton} from '../../../support/constants';
import {readFixture} from '../../../support/drag-drop-utils';

async function verifyColumnValues(page: any, dataCy: string, expectedKeyValues: Array<{key: string; value: string}>) {
  for (let i = 0; i < expectedKeyValues.length; i++) {
    const item = expectedKeyValues[i];
    const row = page.locator(`[data-cy="${dataCy}"]`);
    await expect(row.locator('.cdk-column-key').nth(i)).toContainText(item.key);
    await expect(row.locator('.cdk-column-value').nth(i)).toContainText(item.value);
  }
}

test.describe('Loading Entity value with lang string properties', () => {
  test('should have one entity value with rdf lang string property in on Collection', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfModel = readFixture('entity-value/validFileText');
    await helper.loadModel(rdfModel);

    await helper.dbClickShape('Enumeration');
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

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':Complaint10 a :Mode;');
    expect(rdf).toContain(':modeCode "10"^^xsd:positiveInteger;');
    expect(rdf).toContain(':modeDescription "Test"@de, "Test"@en;');
    expect(rdf).toContain(':ModeDescription a samm-c:Collection;');
    expect(rdf).toContain('ModeValue a samm:Characteristic');
    expect(rdf).toContain(':modeValue "Test"@de');

    expect(rdf).toContain(':Complaint20 a :Mode;');
    expect(rdf).toContain(':modeCode "20"^^xsd:positiveInteger;');

    await page.locator(SELECTOR_editorCancelButton).click({force: true});
  });
});
