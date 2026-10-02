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
import {SELECTOR_ecConstraint, SELECTOR_ecTrait, SELECTOR_elementBtn} from '../../../support/constants';
import {checkAspectAndChildrenConstraint, dragElementToGraph, setupAndDragExternalReference} from '../../../support/drag-drop-utils';

test.describe('Test drag and drop ext constraint - different namespace', () => {
  test('can add Constraint from external reference with different namespace', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await setupAndDragExternalReference(helper, {
      fileName: 'external-constraint-reference.ttl',
      elementName: 'ExternalConstraint',
      elementSelector: SELECTOR_ecConstraint,
      isSameNamespace: false,
      searchTerm: 'constraint',
      x: 100,
      y: 300,
    });

    await page.locator(SELECTOR_elementBtn).click();
    await dragElementToGraph(page, SELECTOR_ecTrait, 1100, 300);

    await helper.clickConnectShapes('property1', 'Trait1');
    await helper.clickConnectShapes('Trait1', 'ExternalConstraint');

    const aspect = await helper.getAspect();
    checkAspectAndChildrenConstraint(aspect);

    const rdf = await helper.getUpdatedRDF();
    expect(rdf).toContain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>.');
    expect(rdf).toContain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
    expect(rdf).toContain('samm:properties (:property1)');
    expect(rdf).toContain(':property1 a samm:Property');
    expect(rdf).toContain('samm:characteristic :Trait1');
    expect(rdf).toContain('samm-c:baseCharacteristic :Characteristic2');
    expect(rdf).toContain(':Characteristic2 a samm:Characteristic');
    expect(rdf).toContain('samm-c:constraint :EncodingConstraint1, ext-different:ExternalConstraint');
    expect(rdf).not.toContain(':ExternalConstraint a samm:EncodingConstraint');
  });
});
