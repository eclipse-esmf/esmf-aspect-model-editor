/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {cyHelp} from '../../support/helpers';
import {SELECTOR_dialogInputModel, SELECTOR_dialogStartButton, SELECTOR_tbLoadButton} from '../../support/constants';
import {Aspect} from '@bame/meta-model';

describe('Test language settings', () => {
  it('can open settings dialog', () => {
    cy.visitDefault();
    cy.startModelling().then(() => cy.get('#settings').click({force: true}));
  });

  it('can see default language', () => {
    cy.get('.mat-tab-labels :nth-child(2)')
      .click({force: true})
      .then(() => cy.get('[data-cy=langCode]').should('be.exist').should('have.value', 'English (en)'));
  });

  it('can add new language', () => {
    cy.get('[data-cy="addLang"]')
      .click({force: true})
      .then(() => cy.get('[data-cy="langCode"]').get('input:last').type('German').get('.mat-option-text:first').click({force: true}))
      .then(() => cy.get('[data-cy="saveButton"]').click({force: true}))
      .then(() =>
        cy
          .get('#settings')
          .click({force: true})
          .then(() => cy.get('.mat-tab-labels :nth-child(2)').click({force: true}))
          .then(() => cy.get('[data-cy="langCode"]').get('input:last').should('be.exist').should('have.value', 'German (de)'))
      );
  });

  it('can delete language', () => {
    cy.get('.delete-icon:last')
      .click({force: true})
      .then(() => cy.get('[data-cy="saveButton"]').click({force: true}))
      .then(() => cy.visitDefault());
    cy.startModelling()
      .then(() => cy.get('#settings').click({force: true}))
      .then(() => cy.get('.mat-tab-labels :nth-child(2)').click({force: true}))
      .then(() => cy.get('[data-cy="langCode"]').should('have.value', 'English (en)'));
  });

  it('can delete and remove all multi language information in the loaded model', () => {
    cy.intercept('POST', 'http://localhost:9091/bame/api/models/validate', {fixture: 'model-validation-response.json'});
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
            cy.get('#settings').click({force: true});
            cy.get('.mat-tab-labels :nth-child(2)').click({force: true});
            cy.get('[data-cy=langCode]').should('have.length', 3);
            cy.get('.delete-icon:last').click({force: true});
            cy.get('.delete-icon:last').click({force: true});
            cy.get('[data-cy="saveButton"]').click({force: true});
            cy.get('.alert-left-btn')
              .should('be.visible')
              .click({force: true})
              .then(() => {
                cy.get('.cdk-overlay-container').should('not.be.visible', 8000);
                cy.getUpdatedRDF().then(rdf => {
                  expect(rdf).not.contain('@en-us');
                  expect(rdf).not.contain('@de-de');
                  expect(rdf).to.contain('@en');
                  cy.getAspect().then((aspect: Aspect) => {
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
