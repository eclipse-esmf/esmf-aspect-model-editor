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

/// <reference types="cypress" />

import {SELECTOR_ecProperty} from '../../../support/constants';
import {checkAspectTree, connectElements, setupAndDragExternalReference} from '../../../support/utils';

describe('Test drag and drop ext properties', () => {
  before(() => {
    cy.visitDefault();
  });

  const fileName = 'external-property-reference.ttl';
  it("can add Property with children's from external reference different namespace", () => {
    setupAndDragExternalReference({
      fileName,
      elementName: 'externalPropertyWithChildren',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: false,
      hasChildren: true,
      searchTerm: 'externalPropertyWithChildren',
      x: 100,
      y: 300,
    })
      .then(() => cy.clickShape('externalPropertyWithChildren'))
      .then(() => connectElements('AspectDefault', 'externalPropertyWithChildren', true))
      .then(() => cy.getAspect())
      .then(checkAspectTree)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
        expect(rdf).to.contain('samm:properties (:property1 ext-different:externalPropertyWithChildren)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
        expect(rdf).not.contain(':externalPropertyWithChildren a samm:Property');
        expect(rdf).not.contain(':ChildrenCharacteristic1 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity1 a samm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a samm:Property');
        expect(rdf).not.contain(':childrenProperty2 a samm:Property');
        expect(rdf).not.contain('samm:characteristic samm-c:Boolean');
        expect(rdf).not.contain(':ChildrenCharacteristic2 a samm:Characteristic');
        expect(rdf).not.contain(':ChildrenEntity2 a samm:Entity');
      });
  });
});
