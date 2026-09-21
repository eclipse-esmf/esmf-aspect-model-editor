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
import {FIELD_name, SELECTOR_ecEvent, SELECTOR_ecOperation, SELECTOR_elementBtn} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

test.describe('Editor - Operations & Events', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('can load events and verify model structure', async ({page}) => {
    const rdfString = readFixture('model-with-events');
    await app.loadModel(rdfString);
    await app.shapeExists('Seats');

    const aspect = await app.getAspect();
    expect(aspect.name).toBe('Seats');
    expect(aspect.events).toHaveLength(2);
    expect(aspect.events[0].name).toBe('SeatMoving');
    expect(aspect.events[1].name).toBe('PassengerPresent');
    expect(aspect.events[0].properties).toHaveLength(4);
    expect(aspect.events[1].properties).toHaveLength(3);
  });

  test('can add and edit operations with input/output properties', async ({page}) => {
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
    await app.shapeExists('AspectDefault');

    await dragElementToGraph(page, SELECTOR_ecOperation, 100, 300);
    await app.clickConnectShapes('AspectDefault', 'operation1');

    await app.clickAddInputShapeIcon('operation1');
    await app.clickAddInputShapeIcon('operation1');
    await app.clickAddOutputShapeIcon('operation1');

    await app.dbClickShape('operation1');
    await page.locator(FIELD_name).clear();
    await page.locator(FIELD_name).fill('newOperation');
    await app.clickSaveButton();

    const aspect = await app.getAspect();
    expect(aspect.operations[0].name).toBe('newOperation');
    expect(aspect.operations[0].input).toHaveLength(2);
    expect(aspect.operations[0].output.name).toBe('property4');

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':AspectDefault a samm:Aspect');
    expect(rdf).toContain('samm:operations (:newOperation)');
    expect(rdf).toContain(':newOperation a samm:Operation');
    expect(rdf).toContain('samm:output :property4');
  });

  test('can add and edit events with properties', async ({page}) => {
    await app.startModelling();
    await page.locator(SELECTOR_elementBtn).click();
    await app.shapeExists('AspectDefault');

    await dragElementToGraph(page, SELECTOR_ecEvent, 100, 300);
    await app.clickConnectShapes('AspectDefault', 'event1');

    await app.clickAddShapePlusIcon('event1');
    await app.clickAddShapePlusIcon('event1');

    await app.dbClickShape('event1');
    await page.locator(FIELD_name).clear();
    await page.locator(FIELD_name).fill('newEvent');
    await app.clickSaveButton();

    const aspect = await app.getAspect();
    expect(aspect.events[0].name).toBe('newEvent');
    expect(aspect.events[0].properties).toHaveLength(2);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':AspectDefault a samm:Aspect');
    expect(rdf).toContain('samm:events (:newEvent)');
    expect(rdf).toContain(':newEvent a samm:Event');
  });
});
