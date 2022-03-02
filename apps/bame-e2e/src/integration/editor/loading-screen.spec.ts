/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {
  SELECTOR_dialogDefaultAspectButton,
  SELECTOR_dialogStartButton,
  SELECTOR_tbLoadButton,
  SELECTOR_tbPrintButton,
  SELECTOR_tbValidateButton,
} from '../../support/constants';

describe('Test loading screen', () => {
  it('can cancel loading model', () => {
    cy.visitDefault();
    cy.get(SELECTOR_tbLoadButton)
      .click({force: true})
      .then(() => cy.get('[data-cy="create-model"]').click({force: true}))
      .then(() => cy.get(SELECTOR_dialogDefaultAspectButton).click({force: true}).wait(2000))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
      .then(() => cy.get('.bosch-ic').click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000));
  });

  it('can cancel validation', () => {
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbValidateButton).click({force: true}))
      .then(() => cy.get('.bosch-ic').click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000));
  });

  it('can cancel generate html documentation', () => {
    cy.get(SELECTOR_tbPrintButton)
      .click({force: true})
      .then(() => cy.get('.bosch-ic').click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000));
  });
});
