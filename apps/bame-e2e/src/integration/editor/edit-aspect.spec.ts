/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {
  FIELD_name,
  SELECTOR_editorSaveButton,
  SELECTOR_nbNotificationsButton,
  SELECTOR_notificationsDialogCloseButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {mxgraph} from 'mxgraph-factory';
import {cyHelp} from '../../support/helpers';
import {Aspect} from '@bame/meta-model';

describe('Test editing Aspect', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {});
  });

  it('can add properties', () => {
    cy.shapeExists('AspectDefault').then(() => {
      cyHelp.addNewProperty(2).then(() => {
        cyHelp.addNewProperty(3).then(() => {
          cyHelp.addNewProperty(4).then(() => {});
        });
      });
    });
  });

  it('can edit name', () => {
    cy.shapeExists('AspectDefault').then(() => {
      cy.dbClickShape('AspectDefault').then((s: mxgraph.mxCell) => {
        const previousGeometry = s.geometry;
        cy.get(FIELD_name).clear().type('NewAspect');
        cy.get(SELECTOR_editorSaveButton)
          .focus()
          .click({force: true})
          .then(() => {
            cy.getUpdatedRDF().then(rdf => {
              expect(rdf).to.contain(':NewAspect');
              expect(rdf).to.contain(':NewAspect a bamm:Aspect');
              cy.clickShape('NewAspect');
              cy.getAspect().then((aspect: Aspect) => {
                expect(aspect.name).to.equal('NewAspect');
              });
            });
          });
      });
    });
  });

  it('can not delete existing', () => {
    cy.shapeExists('NewAspect').then(() => {
      cy.clickShape('NewAspect').then(() => {
        cy.get(SELECTOR_tbDeleteButton)
          .click({force: true})
          .then(() => {
            cy.getAspect().then((aspect: Aspect) => {
              assert.isNotNull(aspect);
            });
            cy.getUpdatedRDF().then(rdf => {
              expect(rdf).to.contain('NewAspect');
            });
            cy.get(SELECTOR_nbNotificationsButton)
              .click({force: true})
              .then(() => {
                assert(cy.contains('.message-title', 'The Aspect can`t be deleted'));
                cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
              });
          });
      });
    });
  });

  it('can delete property1 and property3', () => {
    cy.shapeExists('NewAspect').then(() => {
      cy.clickShape('property1').then(() => {
        cy.get(SELECTOR_tbDeleteButton)
          .click({force: true})
          .then(() => {
            cy.clickShape('property3').then(() => {
              cy.get(SELECTOR_tbDeleteButton)
                .click({force: true})
                .then(() => {
                  cy.getAspect().then((aspect: Aspect) => {
                    expect(aspect.properties).to.have.length(2);
                  });
                  cy.getUpdatedRDF().then(rdf => {
                    expect(rdf).to.contain('bamm:properties (:property2 :property4)');
                  });
                });
            });
          });
      });
    });
  });
});
