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
  FIELD_clearDataTypeBtn,
  FIELD_dataType,
  FIELD_entityValueName,
  FIELD_propertyValueComplex,
  FIELD_propertyValueNotComplex,
  SELECTOR_addEntityValue,
  SELECTOR_editorCancelButton,
  SELECTOR_elementBtn,
  SELECTOR_entitySaveButton,
  SELECTOR_removeEntityValue,
  SELECTOR_searchEntityValueInputField,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test enumeration entity instance', () => {
  test('should create nested entity instances', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.startModelling();

    await page.locator(SELECTOR_elementBtn).click();
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_clearDataTypeBtn).click({force: true});
    await page.locator(FIELD_dataType).fill('NewEntity');
    await page.locator('.mat-mdc-option').filter({hasText: 'NewEntity'}).first().click({force: true});
    await helper.clickSaveButton();

    await helper.shapeExists('NewEntity');
    await helper.clickAddShapePlusIcon('NewEntity');
    await helper.clickAddShapePlusIcon('NewEntity');
    await helper.clickAddShapePlusIcon('Characteristic2');
    await helper.clickAddShapePlusIcon('Characteristic3');

    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="Enumeration"]').click();

    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('ev1');
    await page.locator(FIELD_propertyValueComplex).nth(0).fill('ev2');
    await page.locator('.mat-mdc-option').filter({hasText: 'ev2'}).first().click({force: true});
    await page.locator(FIELD_propertyValueComplex).nth(1).fill('ev3');
    await page.locator('.mat-mdc-option').filter({hasText: 'ev3'}).first().click({force: true});
    await expect(page.locator(SELECTOR_entitySaveButton)).toBeEnabled();
    await page.locator(SELECTOR_entitySaveButton).click();
    await page.locator(SELECTOR_entitySaveButton).waitFor({state: 'detached'});
    await helper.clickSaveButton();

    await helper.shapeExists('ev1');
    await helper.shapeExists('ev2');
    await helper.shapeExists('ev3');

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm-c:values (:ev1).');
    expect(rdf).toContain(':ev1 a :NewEntity;');
    expect(rdf).toContain(':property2 :ev2;');
    expect(rdf).toContain(':property3 :ev3.');
    expect(rdf).toContain(':ev3 a :Entity2.');
    expect(rdf).toContain(':ev2 a :Entity1.');
  });

  test('add entity instances with one property', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.startModelling();

    await page.locator(SELECTOR_elementBtn).click();
    await helper.shapeExists('Characteristic1');
    await helper.clickAddShapePlusIcon('Characteristic1');
    await helper.shapeExists('Entity1');
    await helper.clickAddShapePlusIcon('Entity1');
    await helper.shapeExists('property2');

    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="Enumeration"]').click();

    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('EntityInstance1');
    await page.locator(FIELD_propertyValueNotComplex).fill('TestPropertyValue1');
    await expect(page.locator(SELECTOR_entitySaveButton)).toBeEnabled();
    await page.locator(SELECTOR_entitySaveButton).click();
    await page.locator(SELECTOR_entitySaveButton).waitFor({state: 'detached'});

    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('EntityInstance2');
    await page.locator(FIELD_propertyValueNotComplex).fill('TestPropertyValue2');
    await expect(page.locator(SELECTOR_entitySaveButton)).toBeEnabled();
    await page.locator(SELECTOR_entitySaveButton).click();
    await page.locator(SELECTOR_entitySaveButton).waitFor({state: 'detached'});

    await helper.clickSaveButton();
    await helper.clickShape('Characteristic1');
    await expect(page.locator('[data-cell-id="EntityInstance1"]')).toBeAttached();
    await expect(page.locator('[data-cell-id="EntityInstance2"]')).toBeAttached();

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm-c:values (:EntityInstance1 :EntityInstance2)');
    expect(rdf).toContain(':EntityInstance1 a :Entity1;');
    expect(rdf).toContain(':property2 "TestPropertyValue1"');
    expect(rdf).toContain(':EntityInstance2 a :Entity1;');
    expect(rdf).toContain(':property2 "TestPropertyValue2"');
  });

  test('import new model with entity instances and edit values', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfString = readFixture('entity-values-enumeration');
    await helper.loadModel(rdfString);

    await helper.dbClickShape('Characteristic1');
    await expect(page.locator('.complex-value-items mat-panel-title').nth(0)).toContainText('test1');
    await expect(page.locator('.complex-value-items mat-panel-title').nth(1)).toContainText('test2');
    await expect(page.locator('.complex-value-items mat-panel-title').nth(2)).toContainText('test3');
    await page.locator(SELECTOR_editorCancelButton).click({force: true});

    // Search for entity instance
    await helper.dbClickShape('Characteristic1');
    await page.locator(SELECTOR_searchEntityValueInputField).fill('test2');
    await expect(page.locator('.complex-value-items mat-panel-title').first()).toContainText('test2');
    await helper.clickSaveButton();

    // Delete an entity instance
    await helper.dbClickShape('Characteristic1');
    await page.locator(SELECTOR_removeEntityValue).first().click({force: true});
    await helper.clickSaveButton();

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm-c:values (:test2 :test3)');
    expect(rdf).not.toContain('samm-c:values (:test1');
  });

  test('delete entity instance from canvas', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.startModelling();

    await page.locator(SELECTOR_elementBtn).click();
    await helper.shapeExists('Characteristic1');
    await helper.clickAddShapePlusIcon('Characteristic1');
    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="Enumeration"]').click();

    await page.locator(SELECTOR_addEntityValue).click();
    await page.locator(FIELD_entityValueName).fill('FillGapEntityValue');
    await expect(page.locator(SELECTOR_entitySaveButton)).toBeEnabled();
    await page.locator(SELECTOR_entitySaveButton).click();
    await page.locator(SELECTOR_entitySaveButton).waitFor({state: 'detached'});
    await helper.clickSaveButton();

    await helper.clickAddShapePlusIcon('Characteristic1');
    await helper.shapeExists('entityInstance1');

    // Select and delete entityInstance1 via toolbar delete
    await helper.clickShape('entityInstance1');
    await page.locator(SELECTOR_tbDeleteButton).click({force: true});
    await expect(page.locator('[data-cell-id="entityInstance1"]')).toHaveCount(0);

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm-c:values (:FillGapEntityValue).');
  });
});
