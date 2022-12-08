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

import {SELECTOR_dialogInputModel, SELECTOR_dialogStartButton, SELECTOR_tbLoadButton} from '../../support/constants';

describe('Test load aspect model with anonymous elements', () => {
  it('load aspect model with anonymous elements', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('anonymous-elements')
      .as('rdfString')
      .then(rdfString => {
        cy.get(SELECTOR_tbLoadButton).click({force: true});
        cy.get('[data-cy="create-model"]').click({force: true});
        cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
      })
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
      .then(() => {
        cy.shapeExists('AspectDefault').then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.name).to.equal('AspectDefault');

            expect(aspect.properties[0].property.name).to.equal('property1');
            expect(aspect.properties[0].property.characteristic.name).to.equal('Characteristic1');

            expect(aspect.properties[1].property.name).to.equal('property2');
            expect(aspect.properties[1].property.characteristic.name).to.equal('Characteristic2');

            expect(aspect.properties[2].property.name).to.equal('property3');
            expect(aspect.properties[2].property.characteristic.name).to.equal('Trait1');
            expect(aspect.properties[2].property.characteristic.baseCharacteristic.name).to.equal('Characteristic3');
            expect(aspect.properties[2].property.characteristic.constraints[0].name).to.equal('Constraint1');
            expect(aspect.properties[2].property.characteristic.constraints[1].name).to.equal('Constraint2');

            cy.getUpdatedRDF().then(rdf => {
              expect(rdf).to.contain(
                ':AspectDefault a bamm:Aspect;\n' +
                  '    bamm:properties (:property1 :property2 :property3);\n' +
                  '    bamm:operations ();\n' +
                  '    bamm:events ().\n' +
                  ':property1 a bamm:Property;\n' +
                  '    bamm:characteristic :Characteristic1.\n' +
                  ':property2 a bamm:Property;\n' +
                  '    bamm:characteristic :Characteristic2.\n' +
                  ':property3 a bamm:Property;\n' +
                  '    bamm:characteristic :Trait1.\n' +
                  ':Characteristic1 a bamm:Characteristic;\n' +
                  '    bamm:dataType xsd:string.\n' +
                  ':Characteristic2 a bamm:Characteristic;\n' +
                  '    bamm:dataType xsd:string.\n' +
                  ':Trait1 a bamm-c:Trait;\n' +
                  '    bamm-c:baseCharacteristic :Characteristic3;\n' +
                  '    bamm-c:constraint :Constraint1, :Constraint2.\n' +
                  ':Characteristic3 a bamm:Characteristic.\n' +
                  ':Constraint1 a bamm:Constraint.\n' +
                  ':Constraint2 a bamm:Constraint.\n'
              );
            });
          });
        });
      });
  });
});
