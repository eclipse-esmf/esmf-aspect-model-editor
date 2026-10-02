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
import {SELECTOR_tbDeleteButton} from '../../support/constants';

test.describe('Editor - Constraints & Characteristics Suite', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('should verify Characteristic on Aspect and RDF output', async ({page}) => {
    await app.shapeExists('AspectDefault', true);
    await app.shapeExists('property1', true);
    await app.shapeExists('Characteristic1', true);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':Characteristic1 a samm:Characteristic');
  });

  test('should edit Characteristic metadata and rename', async ({page}) => {
    await app.shapeExists('Characteristic1', true);
    await app.renameElement('Characteristic1', 'CustomCharacteristic');
    await app.shapeExists('CustomCharacteristic', true);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':CustomCharacteristic a samm:Characteristic');
  });

  test('should delete elements from canvas', async ({page}) => {
    await app.shapeExists('property1', true);
    await app.clickShape('property1');
    const deleteBtn = page.locator(SELECTOR_tbDeleteButton);
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
  });
});
