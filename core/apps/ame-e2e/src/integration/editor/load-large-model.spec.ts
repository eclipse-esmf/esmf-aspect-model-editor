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

import {SELECTOR_dialogStartButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test load larde aspect model', () => {
  it('can load large model', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('as-operated')
      .as('rdfString')
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(2000))
      .then(() => {
        cy.shapeExists('AsOperated').then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.name).to.equal('AsOperated');
            expect(aspect.properties).to.have.lengthOf(2);

            expect(aspect.properties[0].property.name).to.equal('timestamp');
            expect(aspect.properties[0].property.characteristic.name).to.equal('Timestamp');

            expect(aspect.properties[1].property.name).to.equal('parameters');
            expect(aspect.properties[1].property.characteristic.name).to.equal('AllParameters');
            expect(aspect.properties[1].property.characteristic.dataType.name).to.equal('AllValues');

            expect(aspect.properties[1].property.characteristic.dataType.properties).to.have.lengthOf(4);

            expect(aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.name).to.equal(
              'SystemParametersEntity'
            );
            expect(aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.name).to.equal(
              'SystemParameters'
            );
            checkComplexEnumerations(aspect);
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties
            ).to.have.lengthOf(17);
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[2].property
                .name
            ).to.equal('housingTemperature');
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[2].property
                .characteristic.name
            ).to.equal('TemperatureRange');
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[2].property
                .characteristic.baseCharacteristic.name
            ).to.equal('Temperature');
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[2].property
                .characteristic.constraints
            ).to.have.lengthOf(1);

            expect(aspect.properties[1].property.characteristic.dataType.properties[1].property.characteristic.name).to.equal(
              'StackParametersEntity'
            );
            expect(aspect.properties[1].property.characteristic.dataType.properties[1].property.characteristic.dataType.name).to.equal(
              'StackParameters'
            );
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[1].property.characteristic.dataType.properties
            ).to.have.lengthOf(5);

            expect(aspect.properties[1].property.characteristic.dataType.properties[2].property.characteristic.name).to.equal(
              'StackParametersEntity'
            );
            expect(aspect.properties[1].property.characteristic.dataType.properties[2].property.characteristic.dataType.name).to.equal(
              'StackParameters'
            );
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[2].property.characteristic.dataType.properties
            ).to.have.lengthOf(5);

            expect(aspect.properties[1].property.characteristic.dataType.properties[3].property.characteristic.name).to.equal(
              'AirGasPathParametersEntity'
            );
            expect(aspect.properties[1].property.characteristic.dataType.properties[3].property.characteristic.dataType.name).to.equal(
              'AirGasPathParameters'
            );
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[3].property.characteristic.dataType.properties
            ).to.have.lengthOf(13);
            expect(
              aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[1].property
                .characteristic.dataType.properties
            ).to.have.lengthOf(2);
          });
        });
      });
  });
});

const checkComplexEnumerations = aspect => {
  expect(
    aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[1].property.name
  ).to.equal('procedureAndStepIdentification');

  const characteristic =
    aspect.properties[1].property.characteristic.dataType.properties[0].property.characteristic.dataType.properties[1].property
      .characteristic;
  expect(characteristic.name).to.equal('ProcedureAndStepNumbers');
  expect(characteristic.values).to.have.lengthOf(32);

  // check first value
  expect(characteristic.values[0].name).to.equal('Code101');
  expect(characteristic.values[0].properties).to.have.lengthOf(2);
  expect(characteristic.values[0].properties[0].key.property.name).to.be.equal('code');
  expect(characteristic.values[0].properties[0].value).to.be.equal('101');
  expect(characteristic.values[0].properties[1].key.property.name).to.be.equal('description');
  expect(characteristic.values[0].properties[1].value).to.be.equal('PLC Started');

  // check last value
  expect(characteristic.values[31].name).to.equal('Code800');
  expect(characteristic.values[31].properties).to.have.lengthOf(2);
  expect(characteristic.values[31].properties[0].key.property.name).to.be.equal('code');
  expect(characteristic.values[31].properties[0].value).to.be.equal('800');
  expect(characteristic.values[31].properties[1].key.property.name).to.be.equal('description');
  expect(characteristic.values[31].properties[1].value).to.be.equal('Testing');

  //check random values
  expect(characteristic.values[15].name).to.equal('Code401');
  expect(characteristic.values[15].properties).to.have.lengthOf(2);
  expect(characteristic.values[15].properties[0].key.property.name).to.be.equal('code');
  expect(characteristic.values[15].properties[0].value).to.be.equal('401');
  expect(characteristic.values[15].properties[1].key.property.name).to.be.equal('description');
  expect(characteristic.values[15].properties[1].value).to.be.equal('Cool down to standby');

  expect(characteristic.values[19].name).to.equal('Code503');
  expect(characteristic.values[19].properties).to.have.lengthOf(2);
  expect(characteristic.values[19].properties[0].key.property.name).to.be.equal('code');
  expect(characteristic.values[19].properties[0].value).to.be.equal('503');
  expect(characteristic.values[19].properties[1].key.property.name).to.be.equal('description');
  expect(characteristic.values[19].properties[1].value).to.be.equal('Purge NG MFC');
};
