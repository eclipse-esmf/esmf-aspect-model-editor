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
import {FIELD_dataType} from '../../support/constants';

test.describe('Edit view stays in sync with graph changes', () => {
  test('updates edges and data type when connecting an entity while the characteristic is open', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.startModelling();

    await helper.dbClickShape('Characteristic1');
    const listTitles = page.locator('ame-element-list h3');
    await expect(listTitles).toHaveText(['Incoming edges (1)', 'Outgoing edges (0)']);
    await expect(page.locator(FIELD_dataType)).toHaveValue('string');

    await helper.clickAddShapePlusIcon('Characteristic1');

    await expect(listTitles).toHaveText(['Incoming edges (1)', 'Outgoing edges (1)']);
    await expect(page.locator(FIELD_dataType)).toHaveValue('Entity1');

    await helper.clickSaveButton();
    const aspect = await helper.getAspect();
    expect(aspect.properties[0].characteristic.dataType.name).toBe('Entity1');
  });

  test('updates outgoing edges when adding a property while the aspect is open', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.startModelling();

    await helper.dbClickShape('AspectDefault');
    const outgoing = page.locator('ame-element-list h3').last();
    await expect(outgoing).toHaveText('Outgoing edges (1)');

    await helper.clickAddShapePlusIcon('AspectDefault');

    await expect(outgoing).toHaveText('Outgoing edges (2)');
  });
});
