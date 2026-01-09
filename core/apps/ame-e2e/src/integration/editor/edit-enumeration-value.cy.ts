/* eslint-disable cypress/no-unnecessary-waiting */
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

/// <reference types="cypress" />

import 'cypress-real-events';
import {FIELD_characteristicName, FIELD_chipIcon, FIELD_values, SELECTOR_ecValue, SELECTOR_elementBtn} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Value', () => {
  it('can add new aspect model', () => {
    cy.visitDefault();
    cy.startModelling().then(() => cy.get(SELECTOR_elementBtn).click());
  });

  it('can add new Value', () => cy.dragElement(SELECTOR_ecValue, 350, 300).then(() => cy.clickShape('Value1')));

  it('can choose created Value element', () => {
    cy.dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_characteristicName).click().get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_values).click().get('mat-option').eq(0).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Characteristic1 a samm-c:Enumeration');
        expect(rdf).to.contain('samm-c:values (:Value1)');
        expect(rdf).to.contain('Value1 a samm:Value');
        expect(rdf).to.contain('samm:value "Value"');
      });
  });

  it('can add Multiple Simple values and Multiple Value elements into values', () => {
    cy.dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_characteristicName).click().get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_values).click().type('a').get('mat-option').eq(0).click())
      .then(() => cy.get(FIELD_values).click().type('b').get('mat-option').eq(0).click())
      .then(() => cy.get(FIELD_values).click().type('Value2').get('mat-option').eq(1).click())
      .then(() => cy.get(FIELD_values).click().type('Value3').get('mat-option').eq(1).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Characteristic1 a samm-c:Enumeration');
        expect(rdf).to.contain('amm-c:values (:Value1 "a" "b" :Value2 :Value3)');
        expect(rdf).to.contain('Value1 a samm:Value');
        expect(rdf).to.contain('Value2 a samm:Value');
        expect(rdf).to.contain('Value3 a samm:Value');
        expect(rdf).to.contain('samm:value "Value"');
      });
  });

  it('can remove Value elements from values', () => {
    cy.dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_chipIcon).each(chip => cy.wrap(chip).click()))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Characteristic1 a samm-c:Enumeration');
        expect(rdf).not.contain('amm-c:values (:Value1 "a" "b" :Value2 :Value3)');
        expect(rdf).to.contain('Value1 a samm:Value');
        expect(rdf).to.contain('Value2 a samm:Value');
        expect(rdf).to.contain('Value3 a samm:Value');
        expect(rdf).to.contain('samm:value "Value"');
      });
  });
});
