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
  SELECTOR_ecConstraint,
  SELECTOR_ecTrait,
  SELECTOR_elementBtn,
  SELECTOR_openNamespacesButton,
  SELECTOR_searchElementsInp,
  SELECTOR_workspaceBtn,
} from '../../../support/constants';
import {cyHelp} from '../../../support/helpers';
import {checkAspectAndChildrenConstraint} from '../../../support/utils';

describe('Test drag and drop ext constraint', () => {
  it('can add Constraint from external reference with same namespace', () => {
    const fileName = 'external-constraint-reference.ttl';
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      statusCode: 200,
      body: {
        'org.eclipse.examples.aspect': [
          {
            version: '1.0.0',
            models: [
              {
                model: fileName,
                aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#ExternalConstraint',
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
        headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.examples.aspect:1.0.0#ExternalConstraint'},
      },
      {
        fixture: `/external-reference/same-namespace/without-childrens/${fileName}`,
      },
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling(true)
        .then(() => cyHelp.checkAspectDefaultExists())
        .then(() => cy.get(SELECTOR_workspaceBtn).click())
        .then(() => cy.get(SELECTOR_openNamespacesButton).contains(fileName).click({force: true}))
        .then(() => cy.get(SELECTOR_searchElementsInp).type('constraint'))
        .then(() => cy.dragElement(SELECTOR_ecConstraint, 100, 300))
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dragElement(SELECTOR_ecTrait, 1100, 300))
        .then(() => cy.clickConnectShapes('property1', 'Trait1'))
        .then(() => cy.clickConnectShapes('Trait1', 'ExternalConstraint'))
        .then(() => cyHelp.hasAddShapeOverlay('Trait1').then(hasAddOverlay => expect(hasAddOverlay).equal(true)))
        .then(() => cy.getAspect())
        .then(checkAspectAndChildrenConstraint)
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:properties (:property1)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Trait1');
          expect(rdf).to.contain('samm-c:baseCharacteristic :Characteristic2');
          expect(rdf).to.contain(':Characteristic2 a samm:Characteristic');
          expect(rdf).to.contain('samm-c:constraint :EncodingConstraint1, :ExternalConstraint');
          expect(rdf).not.contain(':ExternalConstraint a samm:Constraint');
        }),
    );
  });
});
