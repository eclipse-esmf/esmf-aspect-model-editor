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
import {checkAspectTree, connectElements, dragExternalReferenceWithChildren} from '../../../support/utils';

describe('Test drag and drop ext properties', () => {
  const fileName = 'external-property-reference.ttl';
  it("can add Property with children's from external reference different namespace", () => {
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
                aspectModelUrn: 'urn:samm:org.eclipse.different:1.0.0#externalPropertyWithChildren',
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
        headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.different:1.0.0#externalPropertyWithChildren'},
      },
      {
        fixture: `/external-reference/different-namespace/with-childrens/${fileName}`,
      },
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling(true)
        .then(() => cyHelp.checkAspectDefaultExists())
        .then(() => cy.get(SELECTOR_workspaceBtn).click())
        .then(() => cy.get(SELECTOR_openNamespacesButton).contains(fileName).click({force: true}))
        .then(() => cy.get(SELECTOR_searchElementsInp).type('externalPropertyWithChildren').wait(300))
        .then(() => dragExternalReferenceWithChildren(SELECTOR_ecProperty, 100, 300))
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
        }),
    );
  });
});
