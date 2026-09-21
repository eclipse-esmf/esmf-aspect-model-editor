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
  FIELD_left,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_right,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test editing Either', () => {
  test('can change to class Either, configure left/right and update metadata', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await helper.dbClickShape('Characteristic1');
    await helper.selectDropdown(FIELD_characteristicName, 'Either');
    await page.locator(FIELD_name).fill('Either1');

    await helper.selectAutocomplete(FIELD_left, 'LeftCharacteristic');
    await helper.selectAutocomplete(FIELD_right, 'RightCharacteristic');

    await helper.clickSaveButton();

    const aspect = await helper.getAspect();
    expect(aspect.properties[0].characteristic.name).toBe('Either1');
    expect(aspect.properties[0].characteristic.left.name).toBe('LeftCharacteristic');
    expect(aspect.properties[0].characteristic.right.name).toBe('RightCharacteristic');

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('Either1 a samm-c:Either');
    expect(rdf).toContain('samm-c:left :LeftCharacteristic');
    expect(rdf).toContain('samm-c:right :RightCharacteristic');
    expect(rdf).toContain('LeftCharacteristic a samm:Characteristic');
    expect(rdf).toContain('RightCharacteristic a samm:Characteristic');

    // Edit description & preferredName
    await helper.dbClickShape('Either1');
    await page.locator(FIELD_preferredNameen).fill('new-preferredName');
    await page.locator(FIELD_descriptionen).fill('New description for the new created characteristic');
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:preferredName "new-preferredName"@en');
    expect(rdf).toContain('samm:description "New description for the new created characteristic"@en');
  });
});
