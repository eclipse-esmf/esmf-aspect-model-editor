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
  SELECTOR_ecProperty,
  SELECTOR_fileMenuFindElements,
  SELECTOR_namespaceFileMenuButton,
  SELECTOR_openNamespacesButton,
} from '../../../support/constants';
import {checkAspectTree, checkRelationParentChild, connectElements, dragExternalReferenceWithChildren} from '../../../support/utils';

describe('Test drag and drop ext properties', () => {
  it('can add Property from external reference with same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.examples:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.examples:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300))
        .then(() => cy.clickShape('externalProperty'))
        .then(() => connectElements('AspectDefault', 'externalProperty', true))
        .then(() => cy.getAspect())
        .then(aspect => checkRelationParentChild(aspect, 'AspectDefault', 'externalProperty'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:properties (:property1 :externalProperty)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :Characteristic1');
          expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
          expect(rdf).not.contain(':externalProperty a samm:Property');
        })
    );
  });

  it("can add Property with children's from external reference same namespace", () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.examples:1.0.0': ['external-property-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {namespace: 'org.eclipse.examples:1.0.0', 'file-name': 'external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/with-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => dragExternalReferenceWithChildren(SELECTOR_ecProperty, 100, 300))
        .then(() => cy.clickShape('externalPropertyWithChildren'))
        .then(() => connectElements('AspectDefault', 'externalPropertyWithChildren', true))
        .then(() => cy.getAspect())
        .then(checkAspectTree)
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:properties (:property1 :externalPropertyWithChildren)');
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
        })
    );
  });
});
