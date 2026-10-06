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
import {SELECTOR_ecProperty} from '../../../support/constants';
import {checkAspectTree, setupAndDragExternalReference} from '../../../support/drag-drop-utils';

test.describe('Test drag and drop ext properties with children - same namespace', () => {
  test("can add Property with children's from external reference same namespace", async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await setupAndDragExternalReference(helper, {
      fileName: 'external-property-reference.ttl',
      elementName: 'externalPropertyWithChildren',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: true,
      hasChildren: true,
      searchTerm: 'externalPropertyWithChildren',
      x: 100,
      y: 300,
    });

    await helper.clickConnectShapes('AspectDefault', 'externalPropertyWithChildren');

    const aspect = await helper.getAspect();
    checkAspectTree(aspect);

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (:property1 :externalPropertyWithChildren)');
    expect(rdf).toContain(':property1 a samm:Property');
    expect(rdf).toContain('samm:characteristic :Characteristic1');
    expect(rdf).toContain(':Characteristic1 a samm:Characteristic');
    expect(rdf).not.toContain(':externalPropertyWithChildren a samm:Property');
    expect(rdf).not.toContain(':ChildrenCharacteristic1 a samm:Characteristic');
    expect(rdf).not.toContain(':ChildrenEntity1 a samm:Entity');
    expect(rdf).not.toContain(':childrenProperty1 a samm:Property');
    expect(rdf).not.toContain(':childrenProperty2 a samm:Property');
    expect(rdf).not.toContain('samm:characteristic samm-c:Boolean');
    expect(rdf).not.toContain(':ChildrenCharacteristic2 a samm:Characteristic');
    expect(rdf).not.toContain(':ChildrenEntity2 a samm:Entity');
  });
});
