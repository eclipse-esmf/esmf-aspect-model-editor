/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {NAMESPACES_URL, SAMM_VERSION_ACTUAL} from '../../../support/api-mocks';
import {
  SELECTOR_ecProperty,
  SELECTOR_openNamespacesButton,
  SELECTOR_searchElementsInp,
  SELECTOR_workspaceBtn,
} from '../../../support/constants';
import {cyHelp} from '../../../support/helpers';
import {checkRelationParentChild, connectElements} from '../../../support/utils';

describe('Test drag and drop ext properties', () => {
  it('can add Property from external reference with different namespace', () => {
    const fileName = 'external-property-reference.ttl';
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      statusCode: 200,
      body: {
        'org.eclipse.different': [
          {
            version: '1.0.0',
            models: [
              {
                model: fileName,
                aspectModelUrn: 'urn:samm:org.eclipse.different:1.0.0#externalProperty',
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
            ],
          },
        ],
      },
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.different:1.0.0#externalProperty'},
      },
      {
        fixture: `/external-reference/different-namespace/without-childrens/${fileName}`,
      },
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling(true)
        .then(() => cyHelp.checkAspectDefaultExists())
        .then(() => cy.get(SELECTOR_workspaceBtn).click())
        .then(() => cy.get(SELECTOR_openNamespacesButton).contains(fileName).click({force: true}))
        .then(() => cy.get(SELECTOR_searchElementsInp).type('property'))
        .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300))
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
        }),
    );
  });
});
