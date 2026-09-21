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
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test models with intersected names', () => {
  test('should load PredefinedAndCustomCharacteristicsSameName model with all 18 properties', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfString = readFixture('predefined-and-custom-characteristics-same-name');
    await helper.loadModel(rdfString);

    await helper.shapeExists('PredefinedAndCustomCharacteristicsSameName');
    const aspect = await helper.getAspect();
    expect(aspect.name).toBe('PredefinedAndCustomCharacteristicsSameName');
    expect(aspect.properties).toHaveLength(18);
  });
});
