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

import {FIELD_descriptionen, FIELD_preferredNameen} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Trait', () => {
  it('can add new and rename', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {
      cy.shapeExists('Characteristic1')
        .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
        .then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.properties).to.have.length(1);
            expect(aspect.properties[0].characteristic.name).to.equal('Trait1');
          });
        });
    });
  });

  it('can edit description', () => {
    cy.shapeExists('Trait1').then(() => {
      cy.dbClickShape('Trait1').then(() => {
        cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the new created trait', {force: true});
        cyHelp.clickSaveButton().then(() => {
          cy.getUpdatedRDF().then(rdf => {
            expect(rdf).to.contain('samm:description "New description for the new created trait"@en');
            cy.getAspect().then(aspect => {
              expect(aspect.properties[0].characteristic.getDescription('en')).to.equal('New description for the new created trait');
            });
          });
        });
      });
    });
  });

  it('can edit preferredName', () => {
    cy.shapeExists('Trait1').then(() => {
      cy.dbClickShape('Trait1').then(() => {
        cy.get(FIELD_preferredNameen).clear({force: true}).type('new-preferredName');
        cyHelp.clickSaveButton().then(() => {
          cy.getUpdatedRDF().then(rdf => {
            expect(rdf).to.contain('samm:preferredName "new-preferredName"@en');
          });
        });
      });
    });
  });

  it('can generate new constraints on plus click', () => {
    cy.shapeExists('Trait1')
      .then(() => cy.clickAddShapePlusIcon('Trait1'))
      .then(() => cy.shapeExists('EncodingConstraint1'));
  });
});
