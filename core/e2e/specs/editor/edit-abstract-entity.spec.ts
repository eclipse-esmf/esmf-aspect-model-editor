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
  BUTTON_propConfig,
  FIELD_descriptionen,
  FIELD_extends,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  SELECTOR_ecAbstractEntity,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

test.describe('Create and Edit Abstract Entity', () => {
  test('should create, edit fields and connect Abstract Entity', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await dragElementToGraph(page, SELECTOR_ecAbstractEntity, 350, 300);
    await helper.clickShape('AbstractEntity1');

    await helper.dbClickShape('AbstractEntity1');
    await expect(page.locator(FIELD_name)).toBeVisible();
    await expect(page.locator(FIELD_preferredNameen)).toBeVisible();
    await expect(page.locator(FIELD_descriptionen)).toBeVisible();
    await expect(page.locator(FIELD_see)).toBeVisible();
    await expect(page.locator(FIELD_extends)).toBeVisible();
    await expect(page.locator(BUTTON_propConfig)).toBeVisible();

    await page.locator(FIELD_preferredNameen).fill('New preferred Name');
    await page.locator(FIELD_descriptionen).fill('New description');
    await helper.clickSaveButton();

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:preferredName "New preferred Name"@en');
    expect(rdf).toContain('samm:description "New description"@en');
  });

  test('should import and verify abstract entity', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const rdfString = readFixture('abstract-entity');
    await helper.loadModel(rdfString);

    await helper.clickShape('AbstractEntity1');
    const aspect = await helper.getAspect();
    expect(aspect.name).toBe('AspectDefault');
  });
});
