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

test.describe('Test load external reference with different namespace', () => {
  test('Loading property element with their children from external file with different namespace', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await page.route(NAMESPACES_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'org.eclipse.different:1.0.0': ['external-property-reference-with-children.txt'],
        }),
      });
    });

    const fixtureModel = readFixture('external-reference/different-namespace/with-childrens/external-property-reference.ttl');
    await page.route(`${MODELS_BATCH_API_URL}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            aspectModelUrn: 'urn:samm:org.eclipse.different:1.0.0#externalPropertyWithChildren',
            aspectModel: fixtureModel,
            fileName: 'external-property-reference.ttl',
          },
        ]),
      });
    });

    const rdfString = readFixture('external-reference/different-namespace/model-with-external-property-reference-with-childrens.ttl');
    await helper.loadModel(rdfString);

    const aspect = await helper.getAspect();
    expect(aspect.name).toBe('AspectDefault');
    expect(aspect.properties).toHaveLength(1);
    expect(aspect.properties[0].name).toBe('externalPropertyWithChildren');
    expect(aspect.properties[0].characteristic.name).toBe('ChildrenCharacteristic1');

    const entity = aspect.properties[0].characteristic.dataType;
    expect(entity.name).toBe('ChildrenEntity1');
    expect(entity.properties[0].name).toBe('childrenProperty1');
    expect(entity.properties[1].name).toBe('childrenProperty2');

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('@prefix different: <urn:samm:org.eclipse.different:1.0.0#>.');
    expect(rdf).toContain('samm:properties (different:externalPropertyWithChildren)');
    expect(rdf).not.toContain(':externalPropertyWithChildren a samm:Property');
  });
});
