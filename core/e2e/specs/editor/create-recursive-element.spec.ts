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
import {FIELD_characteristicName, SELECTOR_tbDeleteButton} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test create recursive element', () => {
  test('can add, connect, rename and update recursive elements and constraints', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    // 1. Add new elements
    await helper.shapeExists('Characteristic1');
    await helper.clickAddShapePlusIcon('Characteristic1');
    await helper.shapeExists('Entity1');
    await helper.clickAddShapePlusIcon('Entity1');
    await helper.shapeExists('property2');
    await helper.clickAddShapePlusIcon('Entity1');
    await helper.shapeExists('property3');

    // 2. Connect recursive elements
    await helper.clickConnectShapes('Characteristic1', 'property2');
    await helper.clickConnectShapes('Characteristic1', 'property3');

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':property1 a samm:Property;\n    samm:characteristic :Characteristic1.');
    expect(rdf).toContain(':property2 a samm:Property;\n    samm:characteristic :Characteristic1.');
    expect(rdf).toContain(':property3 a samm:Property;\n    samm:characteristic :Characteristic1.');

    let aspect = await helper.getAspect();
    expect(aspect.properties[0].characteristic.dataType.properties[0].characteristic.name).toBe('Characteristic1');
    expect(aspect.properties[0].characteristic.dataType.properties[1].characteristic.name).toBe('Characteristic1');

    // 3. Edit entity name and properties name
    await helper.renameElement('Entity1', 'NewEntity');
    await helper.renameElement('property3', 'newProperty3');
    await helper.renameElement('property2', 'newProperty2');

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':NewEntity');
    expect(rdf).toContain(':NewEntity a samm:Entity');
    expect(rdf).toContain('samm:properties (:newProperty2 :newProperty3)');

    aspect = await helper.getAspect();
    expect(aspect.properties[0].characteristic.dataType.name).toBe('NewEntity');
    expect(aspect.properties[0].characteristic.dataType.properties[0].name).toBe('newProperty2');
    expect(aspect.properties[0].characteristic.dataType.properties[1].name).toBe('newProperty3');

    // 4. Edit characteristic name
    await helper.renameElement('Characteristic1', 'NewCharacteristic');
    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':property1 a samm:Property;\n    samm:characteristic :NewCharacteristic.');
    expect(rdf).toContain(':newProperty2 a samm:Property;\n    samm:characteristic :NewCharacteristic.');
    expect(rdf).toContain(':newProperty3 a samm:Property;\n    samm:characteristic :NewCharacteristic.');

    aspect = await helper.getAspect();
    expect(aspect.properties[0].characteristic.name).toBe('NewCharacteristic');
    expect(aspect.properties[0].characteristic.dataType.properties[0].characteristic.name).toBe('NewCharacteristic');
    expect(aspect.properties[0].characteristic.dataType.properties[1].characteristic.name).toBe('NewCharacteristic');

    // 5. Change characteristic type
    await helper.dbClickShape('NewCharacteristic');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Code"]').click();
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':NewCharacteristic a samm-c:Code');
    expect(rdf).toContain(':property1 a samm:Property;\n    samm:characteristic :NewCharacteristic.');

    // 6. Add constraint to characteristic using trait with recursive properties
    await helper.dbClickShape('NewCharacteristic');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Characteristic"]').click();
    await helper.clickSaveButton();

    await helper.clickConnectShapes('NewCharacteristic', 'NewEntity');
    await helper.clickConnectShapes('NewCharacteristic', 'newProperty2');
    await helper.clickConnectShapes('NewCharacteristic', 'newProperty3');
    await helper.clickAddTraitPlusIcon('NewCharacteristic');
    await helper.shapeExists('Trait1');

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':property1 a samm:Property;\n    samm:characteristic :Trait1.');
    expect(rdf).toContain(':Trait1 a samm-c:Trait;');

    // 7. Delete constraint
    await helper.shapeExists('EncodingConstraint1');
    await helper.clickShape('EncodingConstraint1');
    await page.locator(SELECTOR_tbDeleteButton).click({force: true});
    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain(':property1 a samm:Property;');
    expect(rdf).toContain(':Trait1 a samm-c:Trait;');
  });
});
