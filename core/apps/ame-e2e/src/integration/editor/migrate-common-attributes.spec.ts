/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  FIELD_dataType,
  FIELD_dataTypeOption,
  FIELD_defaultValue,
  FIELD_descriptionen,
  FIELD_elementCharacteristic,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_unit,
  FIELD_values,
  SELECTOR_ecCharacteristic,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test migration of common attributes on Constraint/Characteristic type change', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {});
  });

  it('can add additional attributes', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_preferredNameen).clear({force: true}).type('testPreferredName', {force: true}))
      .then(() => cy.get(FIELD_descriptionen).clear({force: true}).type('testDescription', {force: true}))
      .then(() => cy.addSeeElements('http://see.de'))
      .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
      .then(() =>
        cy.get(FIELD_dataType).clear({force: true}).type('string', {force: true}).get(FIELD_dataTypeOption).eq(1).click({force: true})
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm:Characteristic;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>.'
        )
      );
  });

  it('can change to class Code', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Code').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Code;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>.'
        )
      );
  });

  it('can change to class Collection', () => {
    cy.dragElement(SELECTOR_ecCharacteristic, 350, 300)
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Collection').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_elementCharacteristic)
          .clear({force: true})
          .type('Characteristic', {force: true})
          .get('mat-option')
          .contains('Characteristic2')
          .click({force: true})
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Collection;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:elementCharacteristic :Characteristic2.'
        );
      });
  });

  it('can change to class List', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('List').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:List;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:elementCharacteristic :Characteristic2.'
        )
      );
  });

  it('can change to class Set', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Set').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Set;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:elementCharacteristic :Characteristic2.'
        )
      );
  });

  it('can change to class SortedSet', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('SortedSet').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:SortedSet;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:elementCharacteristic :Characteristic2.'
        )
      );
  });

  it('can change to class TimeSeries', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('TimeSeries').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:TimeSeries;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:elementCharacteristic :Characteristic2.\n'
        )
      );
  });

  it('can change to class Enumeration', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_values).type('1{enter}2{enter}a{enter}b{enter}3{enter}4{enter}', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Enumeration;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:values ("1" "2" "a" "b" "3" "4").'
        );
      });
  });

  it('can change to class State', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('State').click({force: true}))
      .then(() => cy.get(FIELD_defaultValue).type('testState', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).contain(':Characteristic1 a samm-c:State');
        expect(rdf).contain('samm:dataType xsd:string');
        expect(rdf).contain('samm:preferredName "testPreferredName"@en');
        expect(rdf).contain('samm:description "testDescription"@en');
        expect(rdf).contain('samm:see <http://see.de>');
        expect(rdf).contain('samm-c:values ("1" "2" "a" "b" "3" "4")');
      });
  });

  it('can change to class Duration', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Duration').click({force: true}))
      .then(() => cy.get(FIELD_unit).clear({force: true}).type('commonYe').get('mat-option').contains('commonYear').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Duration;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:unit unit:commonYear.'
        )
      );
  });

  it('can change to class Measurement', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() => cy.get(FIELD_unit).should('have.value', 'commonYear'))
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() => cy.get(FIELD_unit).clear({force: true}).type('ampe').get('mat-option').contains('ampere').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Measurement;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:unit unit:ampere.'
        )
      );
  });

  it('can change to class SingleEntity', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('SingleEntity').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:SingleEntity;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>.'
        )
      );
  });

  it('change the characteristic type and return to the old Characteristic type', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Characteristic').click({force: true}))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('SingleEntity').click({force: true}))
      .then(() => cy.get(FIELD_name).should('have.value', 'Characteristic1'))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:SingleEntity;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>.'
        )
      );
  });

  it('check handling with quantifiables to add entity and change unit', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() => cy.get(FIELD_unit).should('have.value', ''))
      .then(() => cy.get(FIELD_unit).clear({force: true}).type('acr').get('mat-option').contains('acre').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Measurement;\n' +
            '    samm:dataType :Entity1;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:unit unit:acre.'
        )
      )
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Duration').click({force: true}))
      .then(() => cy.get(FIELD_unit).should('have.value', 'acre'))
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() =>
        cy.get(FIELD_unit).clear({force: true}).type('day').get('mat-option[data-unit-cy="day"]').contains('day').click({force: true})
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:Duration;\n' +
            '    samm:dataType :Entity1;\n' +
            '    samm:preferredName "testPreferredName"@en;\n' +
            '    samm:description "testDescription"@en;\n' +
            '    samm:see <http://see.de>;\n' +
            '    samm-c:unit unit:day.'
        )
      );
  });
});
