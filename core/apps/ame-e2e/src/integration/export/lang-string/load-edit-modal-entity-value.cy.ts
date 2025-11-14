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
import {NAMESPACES_URL} from '../../../support/api-mocks';

import {
  FIELD_entityValueName,
  FIELD_propertyLanguageValue,
  SELECTOR_addEntityValue,
  SELECTOR_editorSaveButton,
  SELECTOR_entitySaveButton,
} from '../../../support/constants';
import {assertRdf, loadModel, openElementAndAssertValues} from '../../../support/utils';

describe('Loading and edit Entity value RDF lang string properties on modal tests', () => {
  beforeEach(() => {
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
  });

  it('should add entity value with rdf lang string property into collection', () => {
    loadModel('entity-value/validFileText');
    cy.dbClickShape('Enumeration')
      .then(() => cy.get(SELECTOR_addEntityValue).click())
      .then(() => cy.get(FIELD_entityValueName).type('Complaint30'))
      .then(() => cy.get('[data-cy="modeCodeValue"]').type('30'))
      .then(() => cy.get('[data-cy="modeDescriptionValue"]').type('DescriptionOne'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(0).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click(),
      )
      .then(() => cy.get('[data-cy="modeDescriptionAdd"]').click())
      .then(() => cy.get('[data-cy="modeDescriptionValue"]').eq(1).type('DescriptionTwo'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(1).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="modeDescriptionAdd"]').click())
      .then(() => cy.get('[data-cy="modeDescriptionValue"]').eq(2).type('DescriptionThree'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(2).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="modeDescriptionRemove"]').eq(0).click())
      .then(() => cy.get('[data-cy="modeValueValue"]').type('Value'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(2).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click());

    openElementAndAssertValues('Enumeration', [
      {
        dataCy: 'Complaint10',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'modeCode', value: '10'},
          {key: 'modeDescription  (de)', value: 'Test'},
          {key: 'modeDescription  (en)', value: 'Test'},
          {key: 'modeValue  (de)', value: 'Test'},
        ],
      },
      {
        dataCy: 'Complaint20',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'modeCode', value: '20'},
          {key: 'modeDescription  (de)', value: 'Test'},
          {key: 'modeDescription  (en)', value: 'Test'},
          {key: 'modeValue  (de)', value: 'Test'},
        ],
      },
      {
        dataCy: 'Complaint30',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'modeCode', value: '30'},
          {key: 'modeDescription  (de)', value: 'DescriptionOne'},
          {key: 'modeDescription  (en)', value: 'DescriptionThree'},
          {key: 'modeValue  (en)', value: 'Value'},
        ],
      },
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':Complaint10 a :Mode;',
          ':modeCode "10"^^xsd:positiveInteger;',
          ':modeDescription "Test"@de, "Test"@en;',
          ':ModeDescription a samm-c:Collection;',
          'ModeValue a samm:Characteristic',
          ':modeValue "Test"@de',
        ],
      },
      {
        rdfAssertions: [
          ':Complaint20 a :Mode;',
          ':modeCode "20"^^xsd:positiveInteger;',
          ':modeDescription "Test"@de, "Test"@en;',
          ':ModeDescription a samm-c:Collection;',
          'ModeValue a samm:Characteristic',
          ':modeValue "Test"@de',
        ],
      },
    ]);

    cy.get(SELECTOR_editorSaveButton)
      .click()
      .then(() =>
        assertRdf([
          {
            rdfAssertions: [
              ':Complaint30 a :Mode;',
              ':modeCode "30"^^xsd:positiveInteger;',
              ':modeDescription "DescriptionOne"@de, "DescriptionThree"@en;',
              ':ModeDescription a samm-c:Collection;',
              'ModeValue a samm:Characteristic',
              ':modeValue "Value"@en',
            ],
          },
        ]),
      );
  });

  it('should add entity values with rdf lang string into two different collections', () => {
    loadModel('entity-value/twoCollectionSet');
    cy.dbClickShape('Enumeration')
      .then(() => cy.get(SELECTOR_addEntityValue).click())
      .then(() => cy.get(FIELD_entityValueName).type('Complaint30'))
      .then(() => cy.get('[data-cy="modeCodeValue"]').type('30'))
      .then(() => cy.get('[data-cy="modeDescriptionValue"]').type('DescriptionOne'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(0).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click(),
      )
      .then(() => cy.get('[data-cy="modeDescriptionAdd"]').click())
      .then(() => cy.get('[data-cy="modeDescriptionValue"]').eq(1).type('DescriptionTwo'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(1).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="modeDescriptionAdd"]').click())
      .then(() => cy.get('[data-cy="modeDescriptionValue"]').eq(2).type('DescriptionThree'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(2).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="modeDescriptionRemove"]').eq(0).click())
      .then(() => cy.get('[data-cy="modeValueValue"]').type('ValueOne'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(2).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="modeValueAdd"]').click())
      .then(() => cy.get('[data-cy="modeValueValue"]').eq(1).type('ValueTwo'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(3).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click(),
      )
      .then(() => cy.get('[data-cy="modeValueAdd"]').click())
      .then(() => cy.get('[data-cy="modeValueValue"]').eq(2).type('ValueThree'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(4).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click(),
      )
      .then(() => cy.get('[data-cy="modeValueRemove"]').eq(0).click())
      .then(() => cy.get(SELECTOR_entitySaveButton).click());

    openElementAndAssertValues('Enumeration', [
      {
        dataCy: 'Complaint10',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'modeCode', value: '10'},
          {key: 'modeDescription  (de)', value: 'Test'},
          {key: 'modeDescription  (en)', value: 'Test'},
          {key: 'modeValue  (de)', value: 'Test'},
          {key: 'modeValue  (en)', value: 'Test'},
        ],
      },
      {
        dataCy: 'Complaint20',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'modeCode', value: '20'},
          {key: 'modeDescription  (de)', value: 'Test'},
          {key: 'modeDescription  (en)', value: 'Test'},
          {key: 'modeValue  (de)', value: 'Test'},
          {key: 'modeValue  (en)', value: 'Test'},
        ],
      },
      {
        dataCy: 'Complaint30',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'modeCode', value: '30'},
          {key: 'modeDescription  (de)', value: 'DescriptionOne'},
          {key: 'modeDescription  (en)', value: 'DescriptionThree'},
          {key: 'modeValue  (en)', value: 'ValueOne'},
          {key: 'modeValue  (de)', value: 'ValueThree'},
        ],
      },
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':Complaint10 a :Mode;',
          ':modeCode "10"^^xsd:positiveInteger;',
          ':ModeDescription a samm-c:Collection;',
          ':modeDescription "Test"@de, "Test"@en;',
          ':ModeValue a samm-c:Collection',
          ':modeValue "Test"@de, "Test"@en',
        ],
      },
      {
        rdfAssertions: [
          ':Complaint20 a :Mode;',
          ':modeCode "20"^^xsd:positiveInteger;',
          ':ModeDescription a samm-c:Collection;',
          ':modeDescription "Test"@de, "Test"@en;',
          ':ModeValue a samm-c:Collection',
          ':modeValue "Test"@de, "Test"@en',
        ],
      },
    ]);

    cy.get(SELECTOR_editorSaveButton)
      .click()
      .then(() =>
        assertRdf([
          {
            rdfAssertions: [
              ':Complaint30 a :Mode;',
              ':ModeDescription a samm-c:Collection;',
              ':modeDescription "DescriptionOne"@de, "DescriptionThree"@en;',
              ':ModeValue a samm-c:Collection',
              ':modeValue "ValueOne"@en, "ValueThree"@de',
            ],
          },
        ]),
      );
  });
});
