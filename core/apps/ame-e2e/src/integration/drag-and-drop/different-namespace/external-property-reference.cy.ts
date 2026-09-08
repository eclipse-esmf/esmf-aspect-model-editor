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
import {checkRelationParentChild, connectElements, setupAndDragExternalReference} from '../../../support/utils';

describe('Test drag and drop ext properties', () => {
  before(() => {
    cy.visitDefault();
  });

  it('can add Property from external reference with different namespace', () => {
    setupAndDragExternalReference({
      fileName: 'external-property-reference.ttl',
      elementName: 'externalProperty',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: false,
      searchTerm: 'property',
      x: 100,
      y: 300,
    })
      .then(() => cy.clickShape('externalProperty'))
      .then(() => connectElements('AspectDefault', 'externalProperty', true))
      .then(() => cy.getAspect())
      .then(aspect => checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
        expect(rdf).to.contain('samm:properties (:property1 ext-different:externalProperty)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');

        expect(rdf).not.contain(':externalProperty a samm:Property');
      });
  });
});
