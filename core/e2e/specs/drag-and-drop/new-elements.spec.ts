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
  SELECTOR_ecCharacteristic,
  SELECTOR_ecConstraint,
  SELECTOR_ecEntity,
  SELECTOR_ecOperation,
  SELECTOR_ecProperty,
  SELECTOR_ecTrait,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

test.describe('Test drag and drop new elements', () => {
  test('can drag and drop all new elements and connect them', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();

    // Add new Property
    await dragElementToGraph(page, SELECTOR_ecProperty, 100, 300);
    await helper.clickShape('property2');

    // Add new Operation
    await dragElementToGraph(page, SELECTOR_ecOperation, 350, 300);
    await helper.clickShape('operation1');

    // Add new Trait
    await dragElementToGraph(page, SELECTOR_ecTrait, 350, 300);
    await helper.clickShape('Trait1');

    // Add new Characteristic
    await dragElementToGraph(page, SELECTOR_ecCharacteristic, 350, 300);
    await helper.clickShape('Characteristic4');

    // Add new Constraint
    await dragElementToGraph(page, SELECTOR_ecConstraint, 350, 300);
    await helper.clickShape('EncodingConstraint2');

    // Add new Entity
    await dragElementToGraph(page, SELECTOR_ecEntity, 350, 300);
    await helper.clickShape('Entity1');

    // Connect all elements
    await helper.clickConnectShapes('AspectDefault', 'property2');
    await helper.clickConnectShapes('AspectDefault', 'operation1');
    await helper.clickConnectShapes('property2', 'Trait1');
    await helper.clickConnectShapes('Characteristic1', 'Entity1');
    await helper.clickConnectShapes('Characteristic3', 'Entity1');

    const aspect = await helper.getAspect();
    expect(aspect.operations[0].name).toBe('operation1');
    expect(aspect.properties[0].name).toBe('property1');
    expect(aspect.properties[0].characteristic.name).toBe('Characteristic1');
    expect(aspect.properties[0].characteristic.dataType.name).toBe('Entity1');
    expect(aspect.properties[1].name).toBe('property2');
    expect(aspect.properties[1].characteristic.name).toBe('Trait1');
    expect(aspect.properties[1].characteristic.constraints[0].name).toBe('EncodingConstraint1');
    expect(aspect.properties[1].characteristic.baseCharacteristic.name).toBe('Characteristic3');
    expect(aspect.properties[1].characteristic.baseCharacteristic.dataType.name).toBe('Entity1');
  });
});
