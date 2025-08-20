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

import {SELECTOR_notificationsBtn, SELECTOR_notificationsDialogCloseButton} from '../../support/constants';

describe.skip('Test loading aspect with extended external Entity', () => {
  it('should display an error that external reference is not included in the namespace file structure', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('/external-reference/same-namespace/model-with-extended-entity.txt')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => {
        cy.get(SELECTOR_notificationsBtn)
          .click({force: true})
          .then(() =>
            cy
              .wait(500)
              .get('.mat-mdc-cell')
              .contains(
                ' The Aspect model contains an external reference that is not included in the namespace file structure or is invalid',
              )
              .should('exist'),
          )
          .then(() => cy.wait(500).get(SELECTOR_notificationsDialogCloseButton).click({force: true}));
      });
  });

  it('should load a model with an entity that extends an external entity in same namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9090/ame/api/models/namespaces', {
      'org.eclipse.examples:1.0.0': ['example.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {
          namespace: 'org.eclipse.examples:1.0.0',
          'file-name': 'example.txt',
        },
      },
      {
        fixture: '/external-reference/same-namespace/model-with-entity.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/same-namespace/model-with-extended-entity')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectWithExtendedEntity');
        cy.shapeExists('AspectWithExtendedEntity').then(() => {
          cy.shapeExists('Entity2');
          cy.shapeExists('Entity1');
        });
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('Entity2 a samm:Entity');
        expect(rdf).to.contain('samm:extends :Entity1');
      });
  });

  it('should load a model with an entity that extends an external entity in different namespace', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9090/ame/api/models/namespaces', {
      'org.eclipse.different:1.0.0': ['example.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {
          namespace: 'org.eclipse.different:1.0.0',
          'file-name': 'example.txt',
        },
      },
      {
        fixture: '/external-reference/different-namespace/model-with-entity.txt',
      },
    );

    cy.visitDefault();
    cy.fixture('/external-reference/different-namespace/model-with-entity-that-extends-from-different-namespace')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.name).to.equal('AspectWithExtendedEntity');
        cy.shapeExists('AspectWithExtendedEntity').then(() => {
          cy.shapeExists('Entity1');
          cy.shapeExists('DifferentEntity1');
        });
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Entity1 a samm:Entity');
        expect(rdf).to.contain('samm:extends ext-different:DifferentEntity1');
      });
  });
});
