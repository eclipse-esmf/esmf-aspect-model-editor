/* eslint-disable cypress/no-unnecessary-waiting */
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

import {cyHelp} from '../../support/helpers';
import {
  SELECTOR_alertRightButton,
  SELECTOR_dialogInputModel,
  SELECTOR_dialogStartButton,
  SELECTOR_tbLoadButton,
} from '../../support/constants';

describe('Test language settings', () => {
  it('can open settings dialog', () => {
    cy.visitDefault();
    cy.startModelling();
  });

  it('can see default language', () => {
    cyHelp.openSettingsTab(1).then(() => cy.get('[data-cy=langCode]').should('exist').should('have.value', 'English (en)'));
  });

  // Skipped until detect changes is fixed
  it.skip('can add new language', () => {
    cy.get('[data-cy="addLang"]')
      .click({force: true})
      .then(() =>
        cy.get('[data-cy="langCode"]').get('input:last').type('German').wait(1500).get('.mat-mdc-option:first').click({force: true})
      )
      .then(() => cy.get('[data-cy="saveButton"]').click({force: true}))
      .then(() => cyHelp.openSettingsTab(1))
      .then(() => cy.get('[data-cy="langCode"]').get('input:last').should('exist').should('have.value', 'German (de)'));
  });

  // Skipped until detect changes is fixed
  it.skip('can delete language', () => {
    cy.get('.delete-icon:last')
      .click({force: true})
      .then(() => cy.get('[data-cy="saveButton"]').click({force: true}))
      .then(() => cy.visitDefault());
    cy.startModelling()
      .then(() => cyHelp.openSettingsTab(1))
      .then(() => cy.get('[data-cy="langCode"]').should('have.value', 'English (en)'));
  });

  it('can delete and remove all multi language information in the loaded model', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('multi-language-model')
      .as('rdfString')
      .then(rdfString => {
        cy.get(SELECTOR_tbLoadButton).click({force: true});
        cy.get('[data-cy="create-model"]').click({force: true});
        cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
        cy.get(SELECTOR_dialogStartButton)
          .click({force: true})
          .then(() => {
            cy.get('.cdk-overlay-container').should('not.be.visible');
            cyHelp.openSettingsTab(1);
            cy.get('[data-cy=langCode]').should('have.length', 3);
            cy.get('.delete-icon:last').click({force: true});
            cy.get('.delete-icon:last').click({force: true});
            cy.get('[data-cy="saveButton"]').click({force: true});
            cy.get(SELECTOR_alertRightButton)
              .should('be.visible')
              .click({force: true})
              .then(() => {
                cy.get('.cdk-overlay-container').should('not.be.visible', 8000);
                cy.getUpdatedRDF().then(rdf => {
                  expect(rdf).not.contain('@en-us');
                  expect(rdf).not.contain('@de-de');
                  expect(rdf).to.contain('@en');
                  cy.getAspect().then(aspect => {
                    cyHelp.assertNotNullMultiLanguageValues(aspect, 'en');
                    cyHelp.assertNullMultiLanguageValues(aspect, 'en-US');
                    cyHelp.assertNullMultiLanguageValues(aspect, 'de-DE');
                    cyHelp.assertNotNullMultiLanguageValues(aspect.properties[0].property, 'en');
                    cyHelp.assertNullMultiLanguageValues(aspect.properties[0].property, 'en-US');
                    cyHelp.assertNullMultiLanguageValues(aspect.properties[0].property, 'de-DE');
                    cyHelp.assertNotNullMultiLanguageValues(aspect.properties[0].property.characteristic, 'en');
                    cyHelp.assertNullMultiLanguageValues(aspect.properties[0].property.characteristic, 'en-US');
                    cyHelp.assertNullMultiLanguageValues(aspect.properties[0].property.characteristic, 'de-DE');
                  });
                });
              });
          });
      });
  });
});
