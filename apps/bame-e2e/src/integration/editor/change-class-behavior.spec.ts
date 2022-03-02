/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {
  FIELD_characteristicName,
  FIELD_constraintName,
  FIELD_descriptionen,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  SELECTOR_ecCharacteristic,
  SELECTOR_ecConstraint,
} from '../../support/constants';

const constraintClassTypes = [
  'Constraint',
  'EncodingConstraint',
  'FixedPointConstraint',
  'LanguageConstraint',
  'LengthConstraint',
  'LocaleConstraint',
  'RangeConstraint',
  'RegularExpressionConstraint',
];

const characteristicClassTypes = [
  'Characteristic',
  'Code',
  'Collection',
  'Duration',
  'Either',
  'List',
  'Measurement',
  'Quantifiable',
  'Set',
  'SortedSet',
  'SingleEntity',
  'State',
  'TimeSeries',
];

const fields = [
  {selector: FIELD_name, name: 'Name', value: 'ChangedName'},
  {selector: FIELD_descriptionen, name: 'Description', value: 'Changed Description'},
  {selector: FIELD_preferredNameen, name: 'Preferred Name', value: 'Changed Preferred Name'},
  {selector: FIELD_see, name: 'Preferred Name', value: 'http://example.com'},
];

describe('Constraint', () => {
  for (const field of fields) {
    describe(`${field.name} Field`, () => {
      it('should create and rename Constraint', () => {
        cy.visitDefault();
        cy.startModelling()
          .then(() => cy.dragElement(SELECTOR_ecConstraint, 350, 300))
          .then(() => cy.dbClickShape('Constraint1'))
          .then(() => cy.get(field.selector).clear().type(field.value));
      });

      for (const classType of constraintClassTypes) {
        it(`should be the same on ${classType}`, () => {
          cy.get(FIELD_constraintName)
            .click({force: true})
            .get(`mat-option[cy-value="${classType}"]`)
            .click({force: true})
            .then(() => cy.get(field.selector).should('have.value', field.value));
        });
      }
    });
  }
});

describe('Characteristic', () => {
  for (const field of fields) {
    describe(`${field.name} Field`, () => {
      it('should create and rename Characteristic', () => {
        cy.visitDefault();
        cy.startModelling()
          .then(() => cy.dragElement(SELECTOR_ecCharacteristic, 350, 300))
          .then(() => cy.dbClickShape('Characteristic1'))
          .then(() => cy.get(field.selector).clear().type(field.value));
      });

      for (const classType of characteristicClassTypes) {
        it(`should be the same on ${classType}`, () => {
          cy.get(FIELD_characteristicName)
            .click({force: true})
            .get(`mat-option[cy-value="${classType}"]`)
            .click({force: true})
            .then(() => cy.get(field.selector).should('have.value', field.value));
        });
      }
    });
  }
});
