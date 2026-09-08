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

import {SELECTOR_ecEntity} from '../../../support/constants';
import {checkAspectAndChildrenEntity, connectElements, setupAndDragExternalReference} from '../../../support/utils';

describe('Test drag and drop', () => {
  before(() => {
    cy.visitDefault();
  });

  it('can add Entity from external reference with different namespace', () => {
    setupAndDragExternalReference({
      fileName: 'external-entity-reference.ttl',
      elementName: 'ExternalEntity',
      elementSelector: SELECTOR_ecEntity,
      isSameNamespace: false,
      searchTerm: 'entity',
      x: 300,
      y: 300,
    })
      .then(() => cy.clickShape('ExternalEntity'))
      .then(() => connectElements('Characteristic1', 'ExternalEntity', false))
      .then(() => cy.getAspect())
      .then(checkAspectAndChildrenEntity)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
        expect(rdf).to.contain('samm:properties (:property1)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:characteristic :Characteristic1');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
        expect(rdf).to.contain('samm:dataType ext-different:ExternalEntity');

        expect(rdf).not.contain(':ExternalEntity a samm:Entity');
      });
  });
});
