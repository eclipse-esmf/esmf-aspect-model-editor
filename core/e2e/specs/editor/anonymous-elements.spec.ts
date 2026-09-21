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
import {FIELD_characteristicName, FIELD_name, SELECTOR_anonymousToggle} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test load and edit anonymous elements', () => {
  test('load aspect model with anonymous elements', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfString = readFixture('anonymous-elements');
    await helper.loadModel(rdfString);

    await helper.shapeExists('AspectDefault');
    const aspect = await helper.getAspect();
    expect(aspect.name).toBe('AspectDefault');
    expect(aspect.properties[0].name).toBe('property1');
    expect(aspect.properties[0].characteristic.name).toBe('Characteristic1');

    expect(aspect.properties[1].name).toBe('property2');
    expect(aspect.properties[1].characteristic.name).toBe('[Characteristic]');

    expect(aspect.properties[2].name).toBe('property3');
    expect(aspect.properties[2].characteristic.name).toBe('[Trait]');
    expect(aspect.properties[2].characteristic.baseCharacteristic.name).toBe('[Characteristic]');
    expect(aspect.properties[2].characteristic.constraints[0].name).toBe('[Constraint]');
    expect(aspect.properties[2].characteristic.constraints[1].name).toBe('[Constraint]');
  });

  test('can create anonymous default Characteristic and switch type', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await helper.shapeExists('Characteristic1');
    await helper.dbClickShape('Characteristic1');
    await page.locator(SELECTOR_anonymousToggle).locator('button, input').first().click({force: true});
    await expect(page.locator(FIELD_name)).toHaveValue('[Characteristic]');
    await helper.clickSaveButton();

    await helper.shapeExists('[Characteristic]');
    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:characteristic [');
    expect(rdf).toContain('a samm:Characteristic');
    expect(rdf).toContain('samm:dataType xsd:string');

    // Switch to List
    await helper.dbClickShape('[Characteristic]');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[cy-value="List"]').click();
    await expect(page.locator(FIELD_name)).toHaveValue('[List]');
    await helper.clickSaveButton();

    await helper.shapeExists('[List]');
    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:characteristic [');
    expect(rdf).toContain('a samm-c:List');
    expect(rdf).toContain('samm:dataType xsd:string');
  });
});
