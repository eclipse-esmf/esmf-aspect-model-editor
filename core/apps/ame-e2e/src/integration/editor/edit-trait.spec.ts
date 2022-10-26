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

import {Aspect} from '@ame/meta-model';
import {FIELD_descriptionen, FIELD_preferredNameen, SELECTOR_editorSaveButton} from '../../support/constants';

describe('Test editing Trait', () => {
  it('can add new and rename', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {
      cy.shapeExists('Characteristic1')
        .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
        .then(() => {
          cy.getAspect().then((aspect) => {
            expect(aspect.properties).to.have.length(1);
            expect(aspect.properties[0].property.characteristic.name).to.equal('Property1Trait');
          });
        });
    });
  });

  it('can edit description', () => {
    cy.shapeExists('Property1Trait').then(() => {
      cy.dbClickShape('Property1Trait').then(() => {
        cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the new created trait', {force: true});
        cy.get(SELECTOR_editorSaveButton)
          .focus()
          .click({force: true})
          .then(() => {
            cy.getUpdatedRDF().then(() => {
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
    cy.shapeExists('Property1Trait').then(() => {
      cy.dbClickShape('Property1Trait').then(() => {
        cy.get(FIELD_preferredNameen).clear({force: true}).type('new-preferredName');
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
