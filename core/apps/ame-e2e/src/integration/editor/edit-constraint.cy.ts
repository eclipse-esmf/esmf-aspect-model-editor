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

import {
  FIELD_constraintName,
  FIELD_descriptionen,
  FIELD_encodingValue,
  FIELD_integer,
  FIELD_languageCode,
  FIELD_localeCode,
  FIELD_lowerBoundDefinition,
  FIELD_maxValue,
  FIELD_minValue,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_scale,
  FIELD_upperBoundDefinition,
  FIELD_valueConstraint,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Constraint', () => {
  beforeEach(() => {
    cy.visitDefault();
    cy.startModelling();
    // Add Trait to Characteristic1
    cy.shapeExists('Characteristic1')
      .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Trait1'))
      .then(() => cy.shapeExists('EncodingConstraint1'));
  });

  it('can edit basic metadata on Constraint', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_preferredNameen).clear({force: true}).type('My Constraint Preferred Name', {force: true});
      cy.get(FIELD_descriptionen).clear({force: true}).type('Description for constraint', {force: true});
      cy.addSeeElements('https://example.com/constraint-doc');

      cyHelp.clickSaveButton().then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm:preferredName "My Constraint Preferred Name"@en');
          expect(rdf).to.contain('samm:description "Description for constraint"@en');
          expect(rdf).to.contain('samm:see <https://example.com/constraint-doc>');
        });
      });
    });
  });

  it('can change Constraint class to RangeConstraint and configure bounds', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('RangeConstraint').click({force: true});

      cy.get(FIELD_minValue).clear({force: true}).type('10', {force: true});
      cy.get(FIELD_maxValue).clear({force: true}).type('100', {force: true});

      cy.get(FIELD_lowerBoundDefinition).click({force: true}).get('mat-option').contains('AT_LEAST').click({force: true});
      cy.get(FIELD_upperBoundDefinition).click({force: true}).get('mat-option').contains('AT_MOST').click({force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('EncodingConstraint1');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:RangeConstraint');
          expect(rdf).to.contain('samm-c:minValue "10"');
          expect(rdf).to.contain('samm-c:maxValue "100"');
          expect(rdf).to.contain('samm-c:lowerBoundDefinition samm-c:AT_LEAST');
          expect(rdf).to.contain('samm-c:upperBoundDefinition samm-c:AT_MOST');
        });
      });
    });
  });

  it('can change Constraint class to LengthConstraint and configure lengths', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('LengthConstraint').click({force: true});

      cy.get(FIELD_minValue).clear({force: true}).type('1', {force: true});
      cy.get(FIELD_maxValue).clear({force: true}).type('50', {force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('EncodingConstraint1');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:LengthConstraint');
          expect(rdf).to.contain('samm-c:minValue "1"^^xsd:nonNegativeInteger');
          expect(rdf).to.contain('samm-c:maxValue "50"^^xsd:nonNegativeInteger');
        });
      });
    });
  });

  it('can change Constraint class to RegularExpressionConstraint and configure pattern', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('RegularExpressionConstraint').click({force: true});

      cy.get(FIELD_valueConstraint).clear({force: true}).type('^[A-Z0-9]{8}$', {parseSpecialCharSequences: false, force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('EncodingConstraint1');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:RegularExpressionConstraint');
          expect(rdf).to.contain('samm:value "^[A-Z0-9]{8}$"');
        });
      });
    });
  });

  it('can change Constraint class to LocaleConstraint and configure localeCode', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('LocaleConstraint').click({force: true});

      cy.get(FIELD_localeCode).clear({force: true}).type('de-D', {force: true}).get('mat-option').contains('de-DE').click({force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('EncodingConstraint1');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:LocaleConstraint');
          expect(rdf).to.contain('samm-c:localeCode "de-DE"');
        });
      });
    });
  });

  it('can change Constraint class to LanguageConstraint and configure languageCode', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('LanguageConstraint').click({force: true});

      cy.get(FIELD_languageCode).clear({force: true}).type('English', {force: true}).get('mat-option').contains('en').click({force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('EncodingConstraint1');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:LanguageConstraint');
          expect(rdf).to.contain('samm-c:languageCode "en"');
        });
      });
    });
  });

  it('can change Constraint class to FixedPointConstraint and configure scale and integer', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('FixedPointConstraint').click({force: true});

      cy.get(FIELD_scale).clear({force: true}).type('2', {force: true});
      cy.get(FIELD_integer).clear({force: true}).type('5', {force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('EncodingConstraint1');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:FixedPointConstraint');
          expect(rdf).to.contain('samm-c:scale');
          expect(rdf).to.contain('samm-c:integer');
        });
      });
    });
  });

  it('can change encoding value on EncodingConstraint', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_encodingValue).click({force: true}).get('mat-option').contains('US-ASCII').click({force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('a samm-c:EncodingConstraint');
          expect(rdf).to.contain('samm:value samm:US-ASCII');
        });
      });
    });
  });

  it('can rename Constraint and verify model sync', () => {
    cy.dbClickShape('EncodingConstraint1').then(() => {
      cy.get(FIELD_name).clear({force: true}).type('CustomEncodingConstraint', {force: true});

      cyHelp.clickSaveButton().then(() => {
        cy.shapeExists('CustomEncodingConstraint');
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':CustomEncodingConstraint a samm-c:EncodingConstraint');
          expect(rdf).to.contain(':Trait1 a samm-c:Trait');
        });
      });
    });
  });

  it('can delete Constraint from model', () => {
    cy.shapeExists('EncodingConstraint1')
      .then(() => cy.clickShape('EncodingConstraint1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).not.to.contain('EncodingConstraint1');
      });
  });
});
