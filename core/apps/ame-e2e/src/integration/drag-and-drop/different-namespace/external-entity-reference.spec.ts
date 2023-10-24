/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

/// <reference types="Cypress" />

import {SELECTOR_ecEntity, SELECTOR_openNamespacesButton,} from '../../../support/constants';
import {checkAspectAndChildrenEntity, connectElements} from "../utils";

describe('Test drag and drop', () => {
  it('can add Entity from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.different:1.0.0': ['external-entity-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-entity-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
      .then(() => cy.get('.file-name').click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecEntity, 100, 300))
      .then(() => cy.clickShape('ExternalEntity'))
      .then(() => connectElements('Characteristic1', 'ExternalEntity', false))
      .then(() => cy.getAspect())
      .then(checkAspectAndChildrenEntity)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples:1.0.0#>.');
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
