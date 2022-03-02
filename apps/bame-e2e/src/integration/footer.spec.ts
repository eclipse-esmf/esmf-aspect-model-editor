/// <reference types="Cypress" />

describe('BAME Test', () => {
  it('visit BAME!', () => {
    cy.visit('http://localhost:4200/');
  });
});
