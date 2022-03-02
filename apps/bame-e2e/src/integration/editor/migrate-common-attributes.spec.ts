/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
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
  FIELD_see,
  FIELD_unit,
  FIELD_values,
  SELECTOR_ecCharacteristic,
  SELECTOR_editorSaveButton,
} from '../../support/constants';

describe('Test migration of common attributes on Constraint/Characteristic type change', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling().then(() => {});
  });

  it('can add additional attributes', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('testPreferredName'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('testDescription'))
      .then(() => cy.get(FIELD_see).clear().type('http://see.de'))
      .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
      .then(() => cy.get(FIELD_dataType).clear().type('string').get(FIELD_dataTypeOption).eq(1).click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm:Characteristic;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>.'
        )
      );
  });

  it('can change to class Code', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Code').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Code;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>.'
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
          .clear()
          .type('Characteristic')
          .get('mat-option')
          .contains('Characteristic2')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Collection;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:elementCharacteristic :Characteristic2.'
        );
      });
  });

  it('can change to class List', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('List').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:List;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:elementCharacteristic :Characteristic2.'
        )
      );
  });

  it('can change to class Set', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Set').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Set;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:elementCharacteristic :Characteristic2.'
        )
      );
  });

  it('can change to class SortedSet', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('SortedSet').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:SortedSet;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:elementCharacteristic :Characteristic2.'
        )
      );
  });

  it('can change to class TimeSeries', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('TimeSeries').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:TimeSeries;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:elementCharacteristic :Characteristic2.\n'
        )
      );
  });

  it('can change to class Enumeration', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_values).type('1{enter}2{enter}a{enter}b{enter}3{enter}4{enter}'))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Enumeration;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:values ("1" "2" "a" "b" "3" "4").'
        );
      });
  });

  it('can change to class State', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('State').click({force: true}))
      .then(() => cy.get(FIELD_defaultValue).type('testState'))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:State;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:values ("1" "2" "a" "b" "3" "4");\n' +
            '    bamm-c:defaultValue "testState".'
        );
      });
  });

  it('can change to class Duration', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Duration').click({force: true}))
      .then(() => cy.get(FIELD_unit).clear().type('commonYe').get('mat-option').contains('commonYear').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Duration;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:unit unit:commonYear.'
        )
      );
  });

  it('can change to class Measurement', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() => cy.get(FIELD_unit).should('have.value', 'commonYear'))
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() => cy.get(FIELD_unit).clear().type('ampe').get('mat-option').contains('ampere').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Measurement;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:unit unit:ampere.'
        )
      );
  });

  it('can change to class SingleEntity', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('SingleEntity').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:SingleEntity;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>.'
        )
      );
  });

  it('change the characteristic type and return to the old Characteristic type', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Characteristic').click({force: true}))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('SingleEntity').click({force: true}))
      .then(() => cy.get(FIELD_name).should('have.value', 'Characteristic1'))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:SingleEntity;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>.'
        )
      );
  });

  it('check handling with quantifiables to add entity and change unit', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() => cy.get(FIELD_unit).should('have.value', ''))
      .then(() => cy.get(FIELD_unit).clear().type('acr').get('mat-option').contains('acre').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Measurement;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType :Entity1;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:unit unit:acre.'
        )
      )
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Duration').click({force: true}))
      .then(() => cy.get(FIELD_unit).should('have.value', 'acre'))
      .then(() => cy.get('[data-cy=clear-unit-button]').click({force: true}))
      .then(() => cy.get(FIELD_unit).clear().type('day').get('mat-option[data-unit-cy="day"]').contains('day').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:Duration;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType :Entity1;\n' +
            '    bamm:preferredName "testPreferredName"@en;\n' +
            '    bamm:description "testDescription"@en;\n' +
            '    bamm:see <http%3A%2F%2Fsee.de>;\n' +
            '    bamm-c:unit unit:day.'
        )
      );
  });
});
