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

import {
  FIELD_entityValueName,
  FIELD_propertyLanguageValue,
  SELECTOR_addEntityValue,
  SELECTOR_editorSaveButton,
  SELECTOR_entitySaveButton,
} from '../../support/constants';

describe('Entity value RDF lang string properties tests', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
  });

  it('should have one entity value with rdf lang string property in on Collection', () => {
    loadModel('entity-value/validFileText');
    openElementAndAssertEnumerationValues([
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
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':Complaint10 a :Mode;',
          ':modeCode "10"^^xsd:positiveInteger;',
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeDescription a samm-c:Collection;',
          'ModeValue a samm:Characteristic',
          ':modeValue "Test"@de',
        ],
      },
      {
        rdfAssertions: [
          ':Complaint20 a :Mode;',
          ':modeCode "20"^^xsd:positiveInteger;',
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeDescription a samm-c:Collection;',
          'ModeValue a samm:Characteristic',
          ':modeValue "Test"@de',
        ],
      },
    ]);
  });

  it('should have two entity values with rdf lang string in two Collections', () => {
    loadModel('entity-value/twoCollectionSet');
    openElementAndAssertEnumerationValues([
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
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':Complaint10 a :Mode;',
          ':modeCode "10"^^xsd:positiveInteger;',
          ':ModeDescription a samm-c:Collection;',
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeValue a samm-c:Collection',
          ':modeValue ("Test"@de "Test"@en)',
        ],
      },
      {
        rdfAssertions: [
          ':Complaint20 a :Mode;',
          ':modeCode "20"^^xsd:positiveInteger;',
          ':ModeDescription a samm-c:Collection;',
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeValue a samm-c:Collection',
          ':modeValue ("Test"@de "Test"@en)',
        ],
      },
    ]);
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

    openElementAndAssertEnumerationValues([
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
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeDescription a samm-c:Collection;',
          'ModeValue a samm:Characteristic',
          ':modeValue "Test"@de',
        ],
      },
      {
        rdfAssertions: [
          ':Complaint20 a :Mode;',
          ':modeCode "20"^^xsd:positiveInteger;',
          ':modeDescription ("Test"@de "Test"@en);',
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
              ':modeDescription ("DescriptionOne"@de "DescriptionThree"@en);',
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

    openElementAndAssertEnumerationValues([
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
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeValue a samm-c:Collection',
          ':modeValue ("Test"@de "Test"@en)',
        ],
      },
      {
        rdfAssertions: [
          ':Complaint20 a :Mode;',
          ':modeCode "20"^^xsd:positiveInteger;',
          ':ModeDescription a samm-c:Collection;',
          ':modeDescription ("Test"@de "Test"@en);',
          ':ModeValue a samm-c:Collection',
          ':modeValue ("Test"@de "Test"@en)',
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
              ':modeDescription ("DescriptionOne"@de "DescriptionThree"@en);',
              ':ModeValue a samm-c:Collection',
              ':modeValue ("ValueOne"@en "ValueThree"@de)',
            ],
          },
        ]),
      );
  });

  const loadModel = fixturePath => {
    cy.fixture(fixturePath).then(rdfString => cy.loadModel(rdfString));
  };

  const openElementAndAssertEnumerationValues = testCases => {
    cy.dbClickShape('Enumeration').then(() => {
      testCases.forEach(testCase => {
        verifyColumnValues(testCase.dataCy, testCase.expectedKeyValues);
      });
    });
  };

  const assertRdf = testCases => {
    cy.getUpdatedRDF().then(rdf => {
      testCases.forEach(testCase => {
        testCase.rdfAssertions.forEach(assertion => {
          expect(rdf).to.contain(assertion);
        });
      });
    });
  };

  const verifyColumnValues = (dataCy, expectedKeyValues) => {
    expectedKeyValues.forEach((keyValue, index) => {
      cy.get(`[data-cy="${dataCy}"] .cdk-column-key`).eq(index).should('contain', keyValue.key);
      cy.get(`[data-cy="${dataCy}"] .cdk-column-value`).eq(index).should('contain', keyValue.value);
    });
  };
});
