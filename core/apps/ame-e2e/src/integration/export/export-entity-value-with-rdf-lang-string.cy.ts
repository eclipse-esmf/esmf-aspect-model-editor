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
//

describe('Export entity value', () => {
    it('should have entity value with rdf lang string properties values', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
      cy.fixture('/entity-value/validFileText')
        .as('rdfString')
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':Complaint10 a :Mode;');
          expect(rdf).to.contain(':modeCode "10"^^xsd:positiveInteger;');
          expect(rdf).to.contain(':modeDescription ("Test"@de "Test"@en);');
          expect(rdf).to.contain(':ModeDescription a samm-c:Collection;');
          expect(rdf).to.contain('samm:dataType rdf:langString');
          expect(rdf).to.contain('ModeValue a samm:Characteristic');
          expect(rdf).to.contain('samm:dataType rdf:langString');
          expect(rdf).to.contain(':modeValue "Test"@de');
        });
    });
  
    it('should have entity value with rdf lang string with two Collections', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
      cy.fixture('/entity-value/twoCollectionSet')
        .as('rdfString')
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':Complaint10 a :Mode;');
          expect(rdf).to.contain(':modeDescription ("Test"@de "Test"@en);');
          expect(rdf).to.contain(':ModeDescription a samm-c:Collection;');
          expect(rdf).to.contain(':ModeValue a samm-c:Collection');
        });
    });
  });
  