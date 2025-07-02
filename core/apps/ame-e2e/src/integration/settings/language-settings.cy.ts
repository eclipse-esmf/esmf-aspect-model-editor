/* eslint-disable cypress/no-unnecessary-waiting */
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

import {SELECTOR_alertRightButton, SELECTOR_settingsButton, SettingsDialogSelectors} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test language settings', () => {
  it('can open settings dialog', () => {
    cy.visitDefault();
    cy.wait(1000);
    cy.startModelling();
    cy.get(SELECTOR_settingsButton)
      .click()
      .wait(1000)
      .then(() => cy.get(':nth-child(5) > .settings__node').click())
      .then(() => cy.get('[data-cy=langCode]').should('exist').should('have.value', 'English (en)'))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogOkButton).click());
  });

  it('can add new language', () => {
    cy.get(SELECTOR_settingsButton)
      .click()
      .wait(1000)
      .then(() => cy.get(':nth-child(5) > .settings__node').click())
      .then(() => cy.get('[data-cy=langCode]').should('exist').should('have.value', 'English (en)'))
      .then(() => cy.get('[data-cy="addLang"]').click({force: true}))
      .then(() =>
        cy.get('[data-cy="langCode"]').get('input:last').type('German').wait(1500).get('.mat-mdc-option:first').click({force: true}),
      );
    cy.wait(1000)
      .then(() => cy.get('[data-cy="settingsDialogApplyButton"]').click({force: true}))
      .then(() => cy.get('[data-cy="langCode"]').get('input:last').should('exist').should('have.value', 'German (de)'));
  });

  it('can delete language', () => {
    cy.get('.delete-icon:last')
      .click({force: true})
      .then(() => cy.get('[data-cy="settingsDialogApplyButton"]').click({force: true}))
      .then(() => cy.get('[data-cy="alert-left-btn"]').click({force: true}))
      .then(() => cy.get('[data-cy="langCode"]').get('input:last').should('exist').should('have.value', 'English (en)'));
  });

  it('can delete and remove all multi language information in the loaded model', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('multi-language-model')
      .as('rdfString')
      .then(rdfString => {
        cy.loadModel(rdfString).then(() => {
          cy.get('.cdk-overlay-container').should('not.be.visible');
          cy.get(SELECTOR_settingsButton).click().wait(1000);
          cy.get(':nth-child(5) > .settings__node').click();
          cy.get('[data-cy=langCode]').should('have.length', 3);
          cy.get('.delete-icon:last').click({force: true});
          cy.get('.delete-icon:last').click({force: true});
          cy.get(SettingsDialogSelectors.settingsDialogOkButton).click({force: true});
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
