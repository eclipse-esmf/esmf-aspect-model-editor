/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {Aspect} from '@bame/meta-model';
import {mxgraph} from 'mxgraph-factory';
import {
  FIELD_descriptionen,
  FIELD_name,
  FIELD_preferredNameen,
  SELECTOR_editorSaveButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Trait', () => {
  it('can add new and rename', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {
      cy.shapeExists('Characteristic1')
        .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
        .then(() => {
          cy.getAspect().then((aspect: Aspect) => {
            expect(aspect.properties).to.have.length(1);
            expect(aspect.properties[0].property.characteristic.name).to.equal('Property1Trait');
          });
        });
    });
  });

  it('can edit description', () => {
    cy.shapeExists('Property1Trait').then(() => {
      cy.dbClickShape('Property1Trait').then(() => {
        cy.get(FIELD_descriptionen).clear().type('New description for the new created trait');
        cy.get(SELECTOR_editorSaveButton)
          .focus()
          .click({force: true})
          .then(() => {
            cy.getUpdatedRDF().then(rdf => {
              // TODO: resolve after validator fix
              // expect(rdf).to.contain('bamm:description "New description for the new created trait"@en');
              cy.getAspect().then(aspect => {
                expect(aspect.properties[0].property.characteristic.getDescription('en')).to.equal(
                  'New description for the new created trait'
                );
              });
            });
          });
      });
    });
  });

  it('can edit preferredName', () => {
    cy.shapeExists('Property1Trait')
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => {
        cy.dbClickShape('Property1Trait').then(() => {
          cy.get(FIELD_preferredNameen).clear().type('new-preferredName');
          cy.get(SELECTOR_editorSaveButton)
            .focus()
            .click({force: true})
            .then(() => {
              cy.getUpdatedRDF().then(rdf => {
                expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en');
              });
            });
        });
      });
  });

  it('can generate new constraints on plus click', () => {
    cy.shapeExists('Property1Trait')
      .then(() => cy.clickAddShapePlusIcon('Property1Trait'))
      .then(() => cy.shapeExists('Constraint1'));
  });
});
