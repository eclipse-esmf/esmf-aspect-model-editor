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
import {AppHelper} from '../../../support/app-helper';
import {SELECTOR_ecCharacteristic} from '../../../support/constants';
import {checkAspect, setupAndDragExternalReference} from '../../../support/drag-drop-utils';

test.describe('Test drag and drop ext characteristic - same namespace', () => {
  test('can add Characteristic from external reference with same namespace', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await setupAndDragExternalReference(helper, {
      fileName: 'external-characteristic-reference.ttl',
      elementName: 'ExternalCharacteristic',
      elementSelector: SELECTOR_ecCharacteristic,
      isSameNamespace: true,
      searchTerm: 'constraint',
      x: 100,
      y: 300,
    });

    await helper.clickShape('ExternalCharacteristic');
    await helper.clickConnectShapes('property1', 'ExternalCharacteristic');

    const aspect = await helper.getAspect();
    checkAspect(aspect);

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (:property1)');
    expect(rdf).toContain(':property1 a samm:Property');
    expect(rdf).toContain('samm:characteristic :ExternalCharacteristic');
    expect(rdf).not.toContain(':ExternalCharacteristic a samm:Characteristic');
  });
});
