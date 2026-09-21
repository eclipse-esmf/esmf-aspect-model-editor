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

import {test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {FIELD_extends, SELECTOR_tbDeleteButton} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Predefined Entities - Point3D, FileResource, TimeSeriesEntity', () => {
  test('should create and delete Point3d entity structure', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.startModelling();

    await helper.clickAddShapePlusIcon('Characteristic1');
    await helper.dbClickShape('Entity1');
    await page.locator(FIELD_extends).click();
    await page.locator(FIELD_extends).fill('');
    await page.locator(FIELD_extends).pressSequentially('Point3d', {delay: 30});
    const opt = page.locator('mat-option, [data-cy="Point3d"]').filter({hasText: 'Point3d'}).first();
    await opt.waitFor({state: 'visible'});
    await opt.click();
    await helper.clickSaveButton();

    await helper.shapeExists('Point3d');
    await helper.shapeExists('x');
    await helper.shapeExists('y');
    await helper.shapeExists('z');

    // Delete Point3d
    await helper.clickShape('Point3d');
    await page.locator(SELECTOR_tbDeleteButton).click({force: true});
    await helper.shapeExists('Point3d', false);
    await helper.shapeExists('x', false);
    await helper.shapeExists('y', false);
    await helper.shapeExists('z', false);
  });

  test('should create and delete FileResource entity structure', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.startModelling();

    await helper.clickAddShapePlusIcon('Characteristic1');
    await helper.dbClickShape('Entity1');
    await page.locator(FIELD_extends).click();
    await page.locator(FIELD_extends).fill('');
    await page.locator(FIELD_extends).pressSequentially('FileResource', {delay: 30});
    const opt = page.locator('mat-option, [data-cy="FileResource"]').filter({hasText: 'FileResource'}).first();
    await opt.waitFor({state: 'visible'});
    await opt.click();
    await helper.clickSaveButton();

    await helper.shapeExists('FileResource');
    await helper.shapeExists('resource');
    await helper.shapeExists('mimeType');

    // Delete FileResource
    await helper.clickShape('FileResource');
    await page.locator(SELECTOR_tbDeleteButton).click({force: true});
    await helper.shapeExists('FileResource', false);
    await helper.shapeExists('resource', false);
    await helper.shapeExists('mimeType', false);
  });

  test('should create and import TimeSeriesEntity structure', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfString = readFixture('time-series-entity');
    await helper.loadModel(rdfString);

    await helper.shapeExists('TimeSeriesEntity');
    await helper.shapeExists('value');
    await helper.shapeExists('timestamp');
    await helper.shapeExists('Timestamp');
  });
});
