/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {FIELD_descriptionen, FIELD_preferredNameen, SELECTOR_editorSaveButton, SELECTOR_tbCollapseToggle} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test collapse/expand model', () => {
  it('should collapse the entire model', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbCollapseToggle).click({force: true}))
      .then(() => cy.wait(500))
      .then(() => cyHelp.testShapeInCollapsedMode('AspectDefault'))
      .then(() => cyHelp.testShapeInCollapsedMode('property1'))
      .then(() => cyHelp.testShapeInCollapsedMode('Characteristic1'));
  });

  it('should add an entity in collapsed mode', () => {
    cy.clickAddShapePlusIcon('Characteristic1').then(() => cyHelp.testShapeInCollapsedMode('Entity1'));
  });

  it('should expand all models', () => {
    cy.get(SELECTOR_tbCollapseToggle)
      .click({force: true})
      .wait(1000)
      .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
      .then(() => {
        cyHelp.testShapeInExpandMode('AspectDefault');
        cyHelp.testShapeInExpandMode('property1');
        cyHelp.testShapeInExpandMode('Characteristic1');
        cyHelp.testShapeInExpandMode('Entity1');
        cyHelp.testShapeInExpandMode('Constraint1');
      });
  });

  it('should display tooltip information', () => {
    cy.dbClickShape('Characteristic1').then(() => {
      cy.get(FIELD_descriptionen).clear().type('New description for the characteristic');
      cy.get(FIELD_preferredNameen).clear().type('new-preferredName');
      cy.get(SELECTOR_editorSaveButton)
        .focus()
        .click({force: true})
        .then(() => {
          // collapse
          cy.get(SELECTOR_tbCollapseToggle).click({force: true}).wait(1000);
          cy.getHTMLCell('Characteristic1').click({force: true}).wait(2000); // wait for tooltip
          cy.get('.mxTooltip')
            .should('be.visible')
            .should('contain', 'Characteristic1')
            .get('.cell-tooltip table')
            .should('contain', 'description')
            .should('contain', 'New description for the characteristic')
            .should('contain', 'preferredName')
            .should('contain', 'new-preferredName');
        });
    });
  });
});
