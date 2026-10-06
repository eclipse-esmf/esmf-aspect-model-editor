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
import {FIELD_characteristicName, FIELD_name, FIELD_unit} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test editing Unit', () => {
  test('can configure Quantifiable, custom and predefined unit', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_characteristicName).click();
    await page.locator('mat-option[data-testid="Quantifiable"]').click();
    await page.locator(FIELD_unit).fill('CustomUnit1');
    await page.locator('mat-option').filter({hasText: 'CustomUnit1'}).first().click();
    await page.locator(FIELD_name).clear();
    await page.locator(FIELD_name).fill('Quantifiable1');
    await helper.clickSaveButton();

    let aspect = await helper.getAspect();
    expect(aspect.properties[0].characteristic.name).toBe('Quantifiable1');
    expect(aspect.properties[0].characteristic.unit.name).toBe('CustomUnit1');

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('Quantifiable1 a samm-c:Quantifiable');
    expect(rdf).toContain('samm-c:unit :CustomUnit1');
    expect(rdf).toContain('CustomUnit1 a samm:Unit');

    // Change to predefined unit
    await helper.dbClickShape('Quantifiable1');
    await page.locator('[data-testid=clear-unit-button]').click({force: true});
    await page.locator(FIELD_unit).fill('day');
    await page.locator('mat-optgroup[label="Predefined Units"] mat-option').getByText('day', {exact: true}).click({force: true});
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm-c:unit unit:day');
  });
});
