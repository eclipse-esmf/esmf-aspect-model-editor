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

import {FIELD_descriptionen, FIELD_preferredNameen, SELECTOR_editorSaveButton, SELECTOR_tbCollapseToggle} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test collapse/expand model', () => {
  it('should collapse the entire model', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbCollapseToggle).click({force: true}).wait(500))
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
      .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
      .then(() => {
        cyHelp.testShapeInExpandMode('AspectDefault');
        cyHelp.testShapeInExpandMode('property1');
        cyHelp.testShapeInExpandMode('Characteristic1');
        cyHelp.testShapeInExpandMode('Entity1');
        cyHelp.testShapeInExpandMode('EncodingConstraint1');
      });
  });

  it('should display tooltip information', () => {
    cy.dbClickShape('Characteristic1').then(() => {
      cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the characteristic', {force: true});
      cy.get(FIELD_preferredNameen).clear({force: true}).type('new-preferredName', {force: true});
      cy.get(SELECTOR_editorSaveButton)
        .focus()
        .click({force: true})
        .then(() => {
          // collapse
          cy.get(SELECTOR_tbCollapseToggle).click({force: true});
          cy.getHTMLCell('Characteristic1').click({force: true}); // wait for tooltip
          cy.get('.mxTooltip', {timeout: 10000})
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
