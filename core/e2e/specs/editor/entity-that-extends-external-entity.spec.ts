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
import {MODELS_BATCH_API_URL, NAMESPACES_URL} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {readFixture} from '../../support/drag-drop-utils';

test.describe('Test loading aspect with extended external Entity', () => {
  test('should load a model with an entity that extends an external entity in same namespace', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await page.route(NAMESPACES_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'org.eclipse.examples:1.0.0': ['example.txt'],
        }),
      });
    });

    const fixtureModel = readFixture('external-reference/same-namespace/model-with-entity.ttl');
    await page.route(MODELS_BATCH_API_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#Entity1',
            aspectModel: fixtureModel,
            fileName: 'model-with-entity.ttl',
          },
        ]),
      });
    });

    const rdfString = readFixture('external-reference/same-namespace/model-with-extended-entity.ttl');
    await helper.loadModel(rdfString);

    const aspect = await helper.getAspect();
    expect(aspect.name).toBe('AspectWithExtendedEntity');
    await helper.shapeExists('Entity2');
    await helper.shapeExists('Entity1');

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('Entity2 a samm:Entity');
    expect(rdf).toContain('samm:extends :Entity1');
  });
});
