/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

/// <reference types="cypress" />

describe('Test load aspect model with anonymous elements', () => {
  before(() => {
    cy.visitDefault();
  });

  it('load aspect model with anonymous elements', () => {
    cy.fixture('anonymous-elements')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => {
        cy.shapeExists('AspectDefault').then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.name).to.equal('AspectDefault');

            expect(aspect.properties[0].name).to.equal('property1');
            expect(aspect.properties[0].characteristic.name).to.equal('Characteristic1');

            expect(aspect.properties[1].name).to.equal('property2');
            expect(aspect.properties[1].characteristic.name).to.equal('[Characteristic]');

            expect(aspect.properties[2].name).to.equal('property3');
            expect(aspect.properties[2].characteristic.name).to.equal('[Trait]');
            expect(aspect.properties[2].characteristic.baseCharacteristic.name).to.equal('[Characteristic]');
            expect(aspect.properties[2].characteristic.constraints[0].name).to.equal('[Constraint]');
            expect(aspect.properties[2].characteristic.constraints[1].name).to.equal('[Constraint]');
          });
        });
      });
  });
});
