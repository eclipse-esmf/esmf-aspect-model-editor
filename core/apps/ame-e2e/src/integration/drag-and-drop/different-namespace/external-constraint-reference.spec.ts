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

import {
  SELECTOR_closeSidebarButton,
  SELECTOR_ecConstraint,
  SELECTOR_ecTrait,
  SELECTOR_fileMenuFindElements,
  SELECTOR_namespaceFileMenuButton,
  SELECTOR_openNamespacesButton,
} from '../../../support/constants';
import {cyHelp} from '../../../support/helpers';
import {checkAspectAndChildrenConstraint} from '../utils';

describe('Test drag and drop ext constraint', () => {
  it('can add Constraint from external reference with different namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.different:1.0.0': ['external-constraint-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.different:1.0.0', 'file-name': 'external-constraint-reference.txt'},
      },
      {
        fixture: '/external-reference/different-namespace/without-childrens/external-constraint-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => cy.dragElement(SELECTOR_ecConstraint, 100, 300))
        .then(() => cy.clickShape('ExternalConstraint'))
        .then(() => cy.get(SELECTOR_closeSidebarButton).click({force: true}))
        .then(() => cy.dragElement(SELECTOR_ecTrait, 1100, 300).then(() => cy.clickShape('Trait1')))
        .then(() => cy.clickConnectShapes('property1', 'Trait1'))
        .then(() => cy.clickConnectShapes('Trait1', 'Characteristic1'))
        .then(() => cy.clickConnectShapes('Trait1', 'ExternalConstraint'))
        .then(() => cyHelp.hasAddShapeOverlay('Trait1').then(hasAddOverlay => expect(hasAddOverlay).equal(true)))
        .then(() => cy.getAspect())
        .then(checkAspectAndChildrenConstraint)
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples:1.0.0#>.');
          expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
          expect(rdf).to.contain('samm:properties (:property1)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Trait1');
          expect(rdf).to.contain('samm-c:baseCharacteristic :Characteristic1');
          expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
          expect(rdf).to.contain('samm-c:constraint ext-different:ExternalConstraint');
          expect(rdf).not.contain(':ExternalConstraint a samm:Constraint');
        })
    );
  });
});
