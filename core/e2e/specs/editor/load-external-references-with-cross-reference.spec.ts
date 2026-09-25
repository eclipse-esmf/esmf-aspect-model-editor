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

test.describe('Test load external reference with cross references', () => {
  test('Loading different elements from cross referenced file one way', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await page.route(NAMESPACES_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'org.eclipse.digitaltwin:1.0.0': [
            'external-entity-reference.txt',
            'external-characteristic-reference.txt',
            'external-property-reference.txt',
            'external-operation-reference.txt',
          ],
          'org.eclipse.different:1.0.0': [
            'external-entity-reference.txt',
            'external-characteristic-reference.txt',
            'external-property-reference.txt',
            'external-operation-reference.txt',
          ],
        }),
      });
    });

    const sameNsProp = readFixture('external-reference/cross-references/same-namespace/external-property-reference.txt');
    const sameNsOp = readFixture('external-reference/cross-references/same-namespace/external-operation-reference.txt');
    const diffNsProp = readFixture('external-reference/cross-references/different-namespace/external-property-reference.txt');
    const diffNsOp = readFixture('external-reference/cross-references/different-namespace/external-operation-reference.txt');

    await page.route(MODELS_BATCH_API_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            aspectModelUrn: 'urn:samm:org.eclipse.digitaltwin:1.0.0#externalPropertyWithCrossRef1',
            aspectModel: sameNsProp,
            fileName: 'external-property-reference.txt',
          },
          {
            aspectModelUrn: 'urn:samm:org.eclipse.digitaltwin:1.0.0#externalOperationWithCrossRef1',
            aspectModel: sameNsOp,
            fileName: 'external-operation-reference.txt',
          },
          {
            aspectModelUrn: 'urn:samm:org.eclipse.different:1.0.0#externalPropertyWithCrossRef2',
            aspectModel: diffNsProp,
            fileName: 'external-property-reference.txt',
          },
          {
            aspectModelUrn: 'urn:samm:org.eclipse.different:1.0.0#externalOperationWithCrossRef2',
            aspectModel: diffNsOp,
            fileName: 'external-operation-reference.txt',
          },
        ]),
      });
    });

    const rdfString = readFixture('external-reference/cross-references/model-with-cross-referenced-element.txt');
    await helper.loadModel(rdfString);

    const aspect = await helper.getAspect();
    expect(aspect.name).toBe('AspectDefault');
    expect(aspect.operations).toHaveLength(2);
    expect(aspect.operations[0].name).toBe('externalOperationWithCrossRef1');
    expect(aspect.operations[1].name).toBe('externalOperationWithCrossRef2');

    expect(aspect.properties).toHaveLength(2);
    expect(aspect.properties[0].name).toBe('externalPropertyWithCrossRef1');
    expect(aspect.properties[1].name).toBe('externalPropertyWithCrossRef2');
  });
});
