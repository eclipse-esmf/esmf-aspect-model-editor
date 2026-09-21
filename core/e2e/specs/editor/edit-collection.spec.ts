/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {
  FIELD_characteristicName,
  FIELD_dataType,
  FIELD_elementCharacteristic,
  SELECTOR_ecCharacteristic,
  SELECTOR_ecEntity,
  SELECTOR_elementBtn,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

test.describe('Test editing different Collections', () => {
  test('can configure Collection, elementCharacteristic, Entity and rename', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await helper.shapeExists('Characteristic1');
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Collection"]').click();
    await helper.clickSaveButton();

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:characteristic :Characteristic1');
    expect(rdf).toContain('Characteristic1 a samm-c:Collection');

    // Add new Characteristic
    await dragElementToGraph(page, SELECTOR_ecCharacteristic, 350, 300);
    await helper.dbClickShape('Characteristic1');
    const clearDataTypeBtn = page.locator('button[data-testid="clear-dataType-button"]');
    await clearDataTypeBtn.waitFor({state: 'visible'});
    await clearDataTypeBtn.click();
    await page.locator(FIELD_elementCharacteristic).fill('Characteristic2');
    await page.locator('mat-option', {hasText: 'Characteristic2'}).click();
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm-c:elementCharacteristic :Characteristic2');

    // Add new Entity
    await dragElementToGraph(page, SELECTOR_ecEntity, 350, 300);
    await helper.dbClickShape('Characteristic1');
    const clearElemCharBtn = page.locator('button[data-testid="clear-element-characteristic-button"]');
    await clearElemCharBtn.waitFor({state: 'visible'});
    await clearElemCharBtn.click();
    await page.locator(FIELD_dataType).fill('Entity1');
    await page.locator('mat-option', {hasText: 'Entity1'}).click();
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:dataType :Entity1');

    // Rename
    await helper.renameElement('Entity1', 'NewEntity');

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:dataType :NewEntity');
    expect(rdf).toContain('NewEntity a samm:Entity');

    // Delete
    await helper.clickShape('NewEntity');
    await page.locator(SELECTOR_tbDeleteButton).click({force: true});
    rdf = await helper.getUpdatedRDF();
    expect(rdf).not.toContain('NewEntity');
  });
});
