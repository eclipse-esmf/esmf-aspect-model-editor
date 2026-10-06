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
import {FIELD_descriptionen, FIELD_preferredNameen} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test editing Trait', () => {
  test('can add new trait, edit description and preferredName', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await helper.shapeExists('Characteristic1');
    await helper.clickAddTraitPlusIcon('Characteristic1');

    await helper.shapeExists('Trait1');
    const aspect = await helper.getAspect();
    expect(aspect.properties).toHaveLength(1);

    // Edit description
    await helper.dbClickShape('Trait1');
    await page.locator(FIELD_descriptionen).fill('New description for the new created trait');
    await helper.clickSaveButton();

    let rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:description "New description for the new created trait"@en');

    // Edit preferredName
    await helper.dbClickShape('Trait1');
    await page.locator(FIELD_preferredNameen).fill('new-preferredName');
    await helper.clickSaveButton();

    rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:preferredName "new-preferredName"@en');
  });
});
