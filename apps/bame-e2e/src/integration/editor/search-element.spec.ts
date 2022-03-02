import {SELECTOR_searchInputField} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test search for element', () => {
  it('can search for element', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => {
        cy.clickAddShapePlusIcon('AspectDefault');
        cy.clickAddShapePlusIcon('AspectDefault');
        cy.clickAddShapePlusIcon('AspectDefault');
        cy.clickAddShapePlusIcon('AspectDefault');
        cy.wait(4000);
        cy.get(SELECTOR_searchInputField)
          .focus()
          .click({force: true})
          .type('property')
          .get('.mat-autocomplete-panel')
          .children('mat-option')
          .then(listing => {
            expect(listing).to.have.length(5);
          })
          .get('.mat-option-text')
          .each(option => expect(option).to.contain('property'));
      });
  });

  it('can search using * for element', () => {
    cy.get(SELECTOR_searchInputField)
      .focus()
      .clear()
      .click({force: true})
      .type('*5')
      .get('.mat-autocomplete-panel')
      .children('mat-option')
      .then(listing => {
        expect(listing).to.have.length(1);
      })
      .get('.mat-option-text')
      .each(option => expect(option).to.contain('property5'))
      .click({force: true})
      .then(() => cy.contains('property5').should('be.visible'));
  });

  it('can search using $ for element', () => {
    cy.get(SELECTOR_searchInputField)
      .focus()
      .clear()
      .click({force: true})
      .type('c1$')
      .get('.mat-autocomplete-panel')
      .children('mat-option')
      .then(listing => {
        expect(listing).to.have.length(1);
      })
      .get('.mat-option-text')
      .each(option => expect(option).to.contain('Characteristic1'))
      .click({force: true})
      .then(() => cy.contains('Characteristic1').should('be.visible'));
  });

  it('can search using = for element', () => {
    cy.get(SELECTOR_searchInputField)
      .focus()
      .clear()
      .click({force: true})
      .type('=property5')
      .get('.mat-autocomplete-panel')
      .children('mat-option')
      .then(listing => {
        expect(listing).to.have.length(1);
      })
      .get('.mat-option-text')
      .each(option => expect(option).to.contain('property5'))
      .click({force: true})
      .then(() => cy.contains('property5').should('be.visible'));
  });
});
