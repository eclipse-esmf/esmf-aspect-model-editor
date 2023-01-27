/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {SELECTOR_searchInputField} from '../../support/constants';

describe('Test search for element', () => {
  it('can search for element', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {
      cy.clickAddShapePlusIcon('AspectDefault');
      cy.clickAddShapePlusIcon('AspectDefault');
      cy.clickAddShapePlusIcon('AspectDefault');
      cy.clickAddShapePlusIcon('AspectDefault');
      cy.wait(250);
      cy.get(SELECTOR_searchInputField)
        .focus()
        .click({force: true})
        .type('property', {force: true})
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
      .type('*5', {force: true})
      .get('.mat-autocomplete-panel')
      .children('mat-option')
      .then(listing => {
        expect(listing).to.have.length(1);
      })
      .get('.mat-option-text')
      .each(option => expect(option).to.contain('property5'))
      .click({force: true});
    // .then(() => cy.contains('property5').should('be.visible'));
  });

  it('can search using $ for element', () => {
    cy.get(SELECTOR_searchInputField)
      .focus()
      .clear()
      .click({force: true})
      .type('c1$', {force: true})
      .get('.mat-autocomplete-panel')
      .children('mat-option')
      .then(listing => {
        expect(listing).to.have.length(1);
      })
      .get('.mat-option-text')
      .each(option => expect(option).to.contain('Characteristic1'))
      .click({force: true});
    // .then(() => cy.contains('Characteristic1').should('be.visible'));
  });

  it('can search using = for element', () => {
    cy.get(SELECTOR_searchInputField)
      .focus()
      .clear()
      .click({force: true})
      .type('=property5', {force: true})
      .get('.mat-autocomplete-panel')
      .children('mat-option')
      .then(listing => {
        expect(listing).to.have.length(1);
      })
      .get('.mat-option-text')
      .each(option => expect(option).to.contain('property5'))
      .click({force: true});
    // .then(() => cy.contains('property5').should('be.visible'));
  });
});
