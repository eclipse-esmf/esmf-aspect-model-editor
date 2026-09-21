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
import {checkRelationParentChild, setupAndDragExternalReference} from '../../../support/drag-drop-utils';

test.describe('Test drag and drop ext properties - different namespace', () => {
  test('can add Property from external reference with different namespace', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await setupAndDragExternalReference(helper, {
      fileName: 'external-property-reference.ttl',
      elementName: 'externalProperty',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: false,
      searchTerm: 'property',
      x: 100,
      y: 300,
    });

    await helper.clickShape('externalProperty');
    await helper.clickConnectShapes('AspectDefault', 'externalProperty');

    const aspect = await helper.getAspect();
    checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty');

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>.');
    expect(rdf).toContain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
    expect(rdf).toContain('samm:properties (:property1 ext-different:externalProperty)');
    expect(rdf).toContain(':property1 a samm:Property');
    expect(rdf).toContain('samm:characteristic :Characteristic1');
    expect(rdf).toContain(':Characteristic1 a samm:Characteristic');
    expect(rdf).not.toContain(':externalProperty a samm:Property');
  });
});
