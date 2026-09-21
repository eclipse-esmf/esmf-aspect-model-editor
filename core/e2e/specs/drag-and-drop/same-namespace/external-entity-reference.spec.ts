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
import {SELECTOR_ecEntity} from '../../../support/constants';
import {checkAspectAndChildrenEntity, setupAndDragExternalReference} from '../../../support/drag-drop-utils';

test.describe('Test drag and drop ext entity - same namespace', () => {
  test('can add Entity from external reference with same namespace', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await setupAndDragExternalReference(helper, {
      fileName: 'external-entity-reference.ttl',
      elementName: 'ExternalEntity',
      elementSelector: SELECTOR_ecEntity,
      isSameNamespace: true,
      searchTerm: 'entity',
      x: 100,
      y: 300,
    });

    await helper.clickShape('ExternalEntity');
    await helper.clickConnectShapes('Characteristic1', 'ExternalEntity');

    const aspect = await helper.getAspect();
    checkAspectAndChildrenEntity(aspect);

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (:property1)');
    expect(rdf).toContain(':property1 a samm:Property');
    expect(rdf).toContain('samm:characteristic :Characteristic1');
    expect(rdf).toContain(':Characteristic1 a samm:Characteristic');
    expect(rdf).toContain('samm:dataType :ExternalEntity');
    expect(rdf).not.toContain(':ExternalEntity a samm:Entity');
  });
});
