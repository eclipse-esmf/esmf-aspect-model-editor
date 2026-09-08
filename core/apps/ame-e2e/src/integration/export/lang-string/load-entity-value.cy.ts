/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {SELECTOR_editorCancelButton} from '../../../support/constants';
import {assertRdf, loadModel, openElementAndAssertValues} from '../../../support/utils';

describe('Loading Entity value with lang string properties', () => {
  before(() => {
    cy.visitDefault();
  });

  it('should have one entity value with rdf lang string property in on Collection', () => {
    loadModel('entity-value/validFileText');
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
    cy.get(SELECTOR_editorCancelButton).click({force: true});
  });

  it('should have two entity values with rdf lang string in two Collections', () => {
    loadModel('entity-value/twoCollectionSet');
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
    cy.get(SELECTOR_editorCancelButton).click({force: true});
  });
});
