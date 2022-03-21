/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

describe('Sidebar Test', () => {
  it('Can open Notification', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => {
        cy.get('#notifications').click();
        cy.get('[data-cy="close-dialog"]').click({force: true});
      })
      .then(() => {
        cy.get('#help').click();
        cy.get('[data-cy="close-dialog"]').click({force: true});
      })
      .then(() => {
        cy.get('#imprint').click();
        cy.get('.bosch-ic').click({force: true});
      });
  });
});
