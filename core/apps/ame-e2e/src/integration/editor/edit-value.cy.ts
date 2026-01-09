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
import {
  FIELD_descriptionen,
  FIELD_exampleValue,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  FIELD_value,
  SELECTOR_ecValue,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Value', () => {
  it('can add new aspect model', () => {
    cy.visitDefault();
    cy.startModelling().then(() => cy.get(SELECTOR_elementBtn).click());
  });

  it('can add new Value', () => cy.dragElement(SELECTOR_ecValue, 350, 300).then(() => cy.clickShape('Value1')));

  it('can connect Property1 with Value1', () => {
    cy.clickConnectShapes('property1', 'Value1')
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:exampleValue :Value1');
        expect(rdf).to.contain('Value1 a samm:Value');
      });
  });

  it('can check that all fields are visible and check order', () => {
    cy.shapeExists('Value1')
      .then(() => cy.dbClickShape('Value1'))
      .then(() => cy.get(FIELD_name).clear().type('Value2'))
      .then(() => cy.get(FIELD_value).clear().type('Value2'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for Value'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('This is an aspect model'))
      .then(() => cy.get(FIELD_see).clear().type('https://www.example.com').get('mat-option').eq(0).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:exampleValue :Value2');
        expect(rdf).to.contain('Value2 a samm:Value');
        expect(rdf).to.contain('samm:value "Value2"');
        expect(rdf).to.contain('samm:preferredName "New Preffered Name for Value"@en');
        expect(rdf).to.contain('samm:description "This is an aspect model"@en');
        expect(rdf).to.contain('samm:see <https://www.example.com>');
      });
  });

  it('can add new Value from Property exampleValues field', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cyHelp.addNewProperty(2))
      .then(() => cy.dbClickShape('property2'))
      .then(() => cy.get(FIELD_exampleValue).clear().type('Value3').get('mat-option').eq(1).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1 :property2)');
        expect(rdf).to.contain(':property2 a samm:Property');
        expect(rdf).to.contain('samm:exampleValue :Value3');
        expect(rdf).to.contain('Value3 a samm:Value');
        expect(rdf).to.contain('samm:value "Value"');
      })
      .then(() => cy.dbClickShape('Value3'))
      .then(() => cy.get(FIELD_value).clear().type('Value3'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for Value3'))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1 :property2)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain(':property2 a samm:Property');
        expect(rdf).to.contain('samm:exampleValue :Value3');
        expect(rdf).to.contain('Value3 a samm:Value');
        expect(rdf).to.contain('samm:value "Value3"');
        expect(rdf).to.contain('samm:preferredName "New Preffered Name for Value3"@en');
      });
  });

  it('can add simpe value to new Property', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cyHelp.addNewProperty(3))
      .then(() => cy.dbClickShape('property3'))
      .then(() => cy.get(FIELD_exampleValue).clear().type('Simple Value').get('mat-option').eq(0).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:property1 :property2 :property3)');
        expect(rdf).to.contain(':property3 a samm:Property');
        expect(rdf).to.contain('samm:exampleValue "Simple Value"');
      });
  });
});
