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

/// <reference types="Cypress" />

import {
  FIELD_characteristicName,
  FIELD_name,
  FIELD_unit,
  SELECTOR_editorSaveButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {Aspect, DefaultQuantifiable} from '@ame/meta-model';
import {cyHelp} from '../../support/helpers';

describe('Test editing Unit', () => {
  it('can change to class Quantifiable', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Quantifiable').click({force: true}))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('Quantifiable1', {force: true}))
      .then(() =>
        cy
          .get(FIELD_unit)
          .clear({force: true})
          .type('CustomUnit1', {force: true})
          .get('mat-option')
          .contains('CustomUnit1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cyHelp.hasAddShapeOverlay('Quantifiable1'))
      .then(hasAddOverlay => expect(hasAddOverlay).equal(true))
      .then(() => {
        cy.getAspect().then((aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Quantifiable1');
          expect((<DefaultQuantifiable>aspect.properties[0].property.characteristic).unit.name).to.equal('CustomUnit1');
        });
      })
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Quantifiable1 a bamm-c:Quantifiable');
          expect(rdf).to.contain('bamm-c:unit :CustomUnit1');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm:dataType xsd:string');
        });
      });
  });

  it('can change unit connection in edit view', () => {
    cy.dbClickShape('Quantifiable1')
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_unit)
          .clear({force: true})
          .type('CustomUnit2', {force: true})
          .get('mat-option')
          .contains('CustomUnit2')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => {
        cy.getAspect().then((aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Quantifiable1');
          expect((<DefaultQuantifiable>aspect.properties[0].property.characteristic).unit.name).to.equal('CustomUnit2');
        });
      })
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Quantifiable1 a bamm-c:Quantifiable');
          expect(rdf).to.contain('bamm-c:unit :CustomUnit2');
          expect(rdf).to.contain('CustomUnit2 a unit:Unit');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm:dataType xsd:string');

          expect(rdf).not.contain('bamm-c:unit :CustomUnit1');
        });
      });
  });

  it('can remove unit connection in edit view', () => {
    cy.dbClickShape('Quantifiable1')
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => {
        cy.getAspect().then((aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Quantifiable1');
          expect((<DefaultQuantifiable>aspect.properties[0].property.characteristic).unit).to.be.null;
        });
      })
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Quantifiable1 a bamm-c:Quantifiable');
          expect(rdf).to.contain('CustomUnit2 a unit:Unit');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm:dataType xsd:string');

          expect(rdf).not.contain('bamm-c:unit :CustomUnit1');
          expect(rdf).not.contain('bamm-c:unit :CustomUnit2');
        });
      });
  });

  it('can delete unit characteristic', () => {
    cy.dbClickShape('Quantifiable1')
      .then(() =>
        cy
          .get(FIELD_unit)
          .clear({force: true})
          .type('CustomUnit2', {force: true})
          .get('mat-option')
          .contains('CustomUnit2')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.clickShape('CustomUnit2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Quantifiable1');
          expect((<DefaultQuantifiable>aspect.properties[0].property.characteristic).unit).to.be.null;
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Quantifiable1 a bamm-c:Quantifiable');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm:dataType xsd:string');

          expect(rdf).not.contain('CustomUnit2 a unit:Unit');
          expect(rdf).not.contain('bamm-c:unit :CustomUnit1');
          expect(rdf).not.contain('bamm-c:unit :CustomUnit2');
        })
      );
  });

  it('can change to class Measurement', () => {
    cy.dbClickShape('Quantifiable1')
      .then(() =>
        cy
          .get(FIELD_unit)
          .clear({force: true})
          .type('CustomUnit1', {force: true})
          .get('mat-option')
          .contains('CustomUnit1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.dbClickShape('Quantifiable1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('Measurement1', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cyHelp.hasAddShapeOverlay('Measurement1'))
      .then(hasAddOverlay => expect(hasAddOverlay).equal(true))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Measurement1 a bamm-c:Measurement');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm-c:unit :CustomUnit1');
          expect(rdf).to.contain('bamm:dataType xsd:string');
        });
      });
  });

  it('can change to class Duration', () => {
    cy.dbClickShape('Measurement1')
      .then(() => cy.dbClickShape('Measurement1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Duration').click({force: true}))
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('Duration1', {force: true}))
      .then(() =>
        cy
          .get(FIELD_unit)
          .clear({force: true})
          .type('CustomUnit1', {force: true})
          .get('mat-option')
          .contains('CustomUnit1')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cyHelp.hasAddShapeOverlay('Duration1'))
      .then(hasAddOverlay => expect(hasAddOverlay).equal(true))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Duration1 a bamm-c:Duration');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm-c:unit :CustomUnit1');
          expect(rdf).to.contain('bamm:dataType xsd:string');
        });
      });
  });

  it('can change to predefined unit', () => {
    cy.dbClickShape('Duration1')
      .then(() => cy.dbClickShape('Duration1'))
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() => cy.get(FIELD_unit).clear({force: true}).type('day').get('mat-option').eq(1).contains('day').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cyHelp.hasAddShapeOverlay('Duration1'))
      .then(hasAddOverlay => expect(hasAddOverlay).equal(true))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Duration1 a bamm-c:Duration');
          expect(rdf).to.contain('CustomUnit1 a unit:Unit');
          expect(rdf).to.contain('bamm-c:unit unit:day');
          expect(rdf).to.contain('bamm:dataType xsd:string');

          expect(rdf).not.contain('bamm-c:unit :CustomUnit1');
          expect(rdf).not.contain('day a unit:Unit');
        });
      });
  });

  it('can delete existing', () => {
    cy.clickShape('Duration1').then(() => {
      cy.get(SELECTOR_tbDeleteButton)
        .click({force: true})
        .then(() => {
          cy.getAspect().then((aspect) => {
            assert.isNull(aspect.properties[0].property.characteristic);
          });
          cy.getUpdatedRDF().then(rdf => {
            expect(rdf).to.contain('CustomUnit1 a unit:Unit');

            expect(rdf).not.contain('Duration1');
            expect(rdf).not.contain('bamm-c:unit :CustomUnit1');
            expect(rdf).not.contain('bamm:dataType xsd:string');
          });
        });
    });
  });

  it('can filter predefined units', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Quantifiable').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_unit)
          .clear({force: true})
          .type('=metre', {force: true})
          .get('mat-option')
          .last()
          .contains('metre')
          .click({force: true})
      )
  });
});
