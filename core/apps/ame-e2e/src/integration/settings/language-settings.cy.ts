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

import {SELECTOR_alertRightButton, SELECTOR_settingsButton, SettingsDialogSelectors} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test language settings', () => {
  before(() => {
    cy.visitDefault();
  });

  it('can open settings dialog', () => {
    cy.startModelling();
    cy.get(SELECTOR_settingsButton)
      .click()
      .then(() => cy.get(':nth-child(5) > .settings__node').should('be.visible').click())
      .then(() => cy.get('[data-cy=langCode]').should('exist').should('have.value', 'English (en)'))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogOkButton).click());
  });

  it('can add new language', () => {
    cy.get(SELECTOR_settingsButton)
      .click()
      .then(() => cy.get(':nth-child(5) > .settings__node').should('be.visible').click())
      .then(() => cy.get('[data-cy=langCode]').should('exist').should('have.value', 'English (en)'))
      .then(() => cy.get('[data-cy="addLang"]').click({force: true}))
      .then(() => {
        cy.get('[data-cy="langCode"]').last().type('German');
        cy.get('.mat-mdc-option').first().should('be.visible').click({force: true});
      })
      .then(() => cy.get('[data-cy="settingsDialogApplyButton"]').should('be.visible').click({force: true}))
      .then(() => cy.get('[data-cy="langCode"]').last().should('exist').should('have.value', 'German (de)'));
  });

  it('can delete language', () => {
    cy.get('.delete-icon:last')
      .click({force: true})
      .then(() => cy.get('[data-cy="settingsDialogApplyButton"]').click({force: true}))
      .then(() => cy.get('[data-cy="alert-left-btn"]').click({force: true}))
      .then(() => cy.get('[data-cy="langCode"]').last().should('exist').should('have.value', 'English (en)'))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogCancelButton).click());
  });

  it('can delete and remove all multi language information in the loaded model', () => {
    cy.fixture('multi-language-model')
      .as('rdfString')
      .then(rdfString => {
        cy.loadModel(rdfString).then(() => {
          cy.get('mat-dialog-container').should('not.exist');
          cy.get(SELECTOR_settingsButton).click();
          cy.get(':nth-child(5) > .settings__node').should('be.visible').click();
          cy.get('[data-cy=langCode]').should('have.length', 3);
          cy.get('.delete-icon:last').click({force: true});
          cy.get('.delete-icon:last').click({force: true});
          cy.get(SettingsDialogSelectors.settingsDialogOkButton).click({force: true});
          cy.get(SELECTOR_alertRightButton)
            .should('be.visible')
            .click({force: true})
            .then(() => {
              cy.get('mat-dialog-container', {timeout: 8000}).should('not.exist');
              cy.getUpdatedRDF().then(rdf => {
                expect(rdf).not.contain('@en-us');
                expect(rdf).not.contain('@de-de');
                expect(rdf).to.contain('@en');
                cy.getAspect().then(aspect => {
                  cyHelp.assertNotNullMultiLanguageValues(aspect, 'en');
                  cyHelp.assertNullMultiLanguageValues(aspect, 'en-US');
                  cyHelp.assertNullMultiLanguageValues(aspect, 'de-DE');
                  cyHelp.assertNotNullMultiLanguageValues(aspect.properties[0], 'en');
                  cyHelp.assertNullMultiLanguageValues(aspect.properties[0], 'en-US');
                  cyHelp.assertNullMultiLanguageValues(aspect.properties[0], 'de-DE');
                  cyHelp.assertNotNullMultiLanguageValues(aspect.properties[0].characteristic, 'en');
                  cyHelp.assertNullMultiLanguageValues(aspect.properties[0].characteristic, 'en-US');
                  cyHelp.assertNullMultiLanguageValues(aspect.properties[0].characteristic, 'de-DE');
                });
              });
            });
        });
      });
  });
});
