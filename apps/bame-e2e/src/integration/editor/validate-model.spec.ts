/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {SELECTOR_nbNotificationsButton, SELECTOR_notificationsDialogCloseButton, SELECTOR_tbValidateButton} from '../../support/constants';

describe('Test validate Aspect', () => {
  it('can validate default model', () => {
    cy.intercept('POST', 'http://localhost:9091/bame/api/models/validate', {fixture: 'response-default-model-validation'});
    cy.visitDefault();
    cy.startModelling().then(() => {
      cy.get(SELECTOR_tbValidateButton)
        .click({force: true})
        .then(() => {
          cy.get('.cdk-overlay-container').should('not.be.visible', 8000);
          cy.get(SELECTOR_nbNotificationsButton)
            .click({force: true})
            .then(() => {
              assert(cy.contains('.message-title', 'Error on element property1: A Property without a Characteristic has not been refined.'));
              cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
            });
        });
    });
  });
});
