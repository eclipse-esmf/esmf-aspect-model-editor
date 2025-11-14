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
import {NAMESPACES_URL} from '../../support/api-mocks';

import {
  FIELD_characteristicName,
  FIELD_constraintName,
  FIELD_descriptionen,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  SELECTOR_ecCharacteristic,
  SELECTOR_ecConstraint,
  SELECTOR_elementBtn,
} from '../../support/constants';

const constraintClassTypes = [
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
  {selector: FIELD_see, name: 'See', value: 'http://example.com'},
];

describe('Constraint', () => {
  for (const field of fields) {
    describe(`${field.name} Field`, () => {
      it('should create and rename Constraint', () => {
        cy.visitDefault();
        cy.startModelling()
          .then(() => cy.shapeExists('AspectDefault'))
          .then(() => cy.get(SELECTOR_elementBtn).click())
          .then(() => cy.dragElement(SELECTOR_ecConstraint, 350, 300))
          .then(() => cy.dbClickShape('EncodingConstraint1'))
          .then(() => cy.get(field.selector).clear({force: true}).type(field.value, {force: true}));
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
        cy.intercept('GET', NAMESPACES_URL, {statusCode: 200, body: {}});
        cy.visitDefault();
        cy.startModelling()
          .then(() => cy.shapeExists('AspectDefault'))
          .then(() => cy.get(SELECTOR_elementBtn).click())
          .then(() => cy.dragElement(SELECTOR_ecCharacteristic, 350, 300))
          .then(() => cy.dbClickShape('Characteristic1'))
          .then(() => {
            cy.get(field.selector).clear({force: true}).type(field.value, {force: true});
            if (field.selector === FIELD_see) {
              cy.get(`[data-cy="option__${field.value}"]`).click({force: true});
            }
          });
      });

      for (const classType of characteristicClassTypes) {
        it(`should be the same on ${classType}`, () => {
          cy.get(FIELD_characteristicName)
            .click({force: true})
            .get(`mat-option[cy-value="${classType}"]`)
            .click({force: true})
            .then(() => {
              if (field.selector === FIELD_see) {
                cy.get(`[data-cy="chip__${field.value}"] .chip-content`).should('contain.text', field.value);
              } else {
                cy.get(field.selector).should('have.value', field.value);
              }
            });
        });
      }
    });
  }
});
