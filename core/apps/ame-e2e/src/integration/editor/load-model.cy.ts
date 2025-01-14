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

/// <reference types="Cypress" />

import {
  FIELD_constraintName,
  FIELD_dataType,
  FIELD_dataTypeOption,
  FIELD_languageCode,
  FIELD_localeCode,
  FIELD_unit,
  META_MODEL_languageCode,
  META_MODEL_localeCode,
  META_MODEL_maxValue,
  META_MODEL_minValue,
  META_MODEL_scale,
  META_MODEL_value,
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test load different characteristics', () => {
  it('can load characteristic classes', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('all-characteristic')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => {
        cy.shapeExists('AspectWithAllCharacteristic').then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.name).to.equal('AspectWithAllCharacteristic');
            expect(aspect.properties).to.have.lengthOf(9);

            expect(aspect.properties[0].property.name).to.equal('testCodeProperty');
            expect(aspect.properties[0].property.characteristic.name).to.equal('TestCode');

            expect(aspect.properties[1].property.name).to.equal('testCollectiontProperty');
            expect(aspect.properties[1].property.characteristic.name).to.equal('TestCollection');

            expect(aspect.properties[2].property.name).to.equal('testDurationProperty');
            expect(aspect.properties[2].property.characteristic.name).to.equal('TestDuration');
            expect(aspect.properties[2].property.characteristic.unit.name).to.equal('kilosecond');

            expect(aspect.properties[3].property.name).to.equal('testEnumerationProperty');
            expect(aspect.properties[3].property.characteristic.name).to.equal('TestEnumeration');
            expect(aspect.properties[3].property.characteristic.values).to.have.lengthOf(3);
            expect(aspect.properties[3].property.characteristic.values[0]).to.equal('1');
            expect(aspect.properties[3].property.characteristic.values[1]).to.equal('2');
            expect(aspect.properties[3].property.characteristic.values[2]).to.equal('3');

            expect(aspect.properties[4].property.name).to.equal('testListProperty');
            expect(aspect.properties[4].property.characteristic.name).to.equal('TestList');

            expect(aspect.properties[5].property.name).to.equal('testMeasurementProperty');
            expect(aspect.properties[5].property.characteristic.name).to.equal('TestMeasurement');
            expect(aspect.properties[5].property.characteristic.unit.name).to.equal('kelvin');

            expect(aspect.properties[6].property.name).to.equal('testQuantifiableProperty');
            expect(aspect.properties[6].property.characteristic.name).to.equal('TestQuantifiable');

            expect(aspect.properties[7].property.name).to.equal('testSetProperty');
            expect(aspect.properties[7].property.characteristic.name).to.equal('TestSet');

            expect(aspect.properties[8].property.name).to.equal('testSortedSetProperty');
            expect(aspect.properties[8].property.characteristic.name).to.equal('TestSortedSet');
          });
        });
      });
  });

  context('TestCode', () => {
    it('can add LengthConstraint', () => {
      cy.clickAddTraitPlusIcon('TestCode')
        .then(() => cy.dbClickShape('Constraint1'))
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true}).get('mat-option').contains('LengthConstraint').click({force: true});
          cy.get('[data-cy="minValue"]').type('1', {force: true}).click({force: true});
          cy.get('[data-cy="maxValue"]').type('10', {force: true}).click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint1');
          expect(rdf).to.contain('Constraint1 a samm-c:LengthConstraint');
          expect(rdf).to.contain('samm-c:minValue "1"^^xsd:nonNegativeInteger');
          expect(rdf).to.contain('samm-c:maxValue "10"^^xsd:nonNegativeInteger');
          cy.clickShape('Constraint1');
        });
    });
  });

  context('TestMeasurement', () => {
    it('can modify unit', () => {
      cy.dbClickShape('TestMeasurement')
        .then(() => {
          cy.get('[data-cy=clear-unit-button]').click({force: true});
          cy.get(FIELD_unit)
            .clear({force: true})
            .type('amperePerM', {force: true})
            .get('mat-option')
            .contains('amperePerMetre')
            .click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm-c:unit unit:amperePerMetre')));
    });

    it('can modify dataType', () => {
      cy.dbClickShape('TestMeasurement')
        .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
        .then(() =>
          cy.get(FIELD_dataType).clear({force: true}).type('double', {force: true}).get(FIELD_dataTypeOption).eq(0).click({force: true}),
        )
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:dataType xsd:double')));
    });

    it('can add FixedPointConstraint', () => {
      cy.clickAddTraitPlusIcon('TestMeasurement')
        .then(() => cy.dbClickShape('Constraint2'))
        .then(() => {
          cy.get(FIELD_constraintName)
            .click({force: true})
            .then(() => cyHelp.forceChangeDetection())
            .get('mat-option')
            .contains('FixedPointConstraint')
            .click({force: true});
          cy.get(SELECTOR_editorSaveButton).should('be.disabled');
          cy.get('[data-cy="scale"]').type('1', {force: true}).click({force: true});
          cy.get('[data-cy="integer"]').type('1', {force: true}).click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint2');
          expect(rdf).to.contain('Constraint2 a samm-c:FixedPointConstraint');
          expect(rdf).to.contain('samm-c:integer "1"^^xsd:positiveInteger');
          expect(rdf).to.contain('samm-c:scale "1"^^xsd:positiveInteger');
        });
    });

    it('can not enter incorrect value for scale', () => {
      cy.dbClickShape('Constraint2')
        .then(() => cy.get('[data-cy="scale"]').clear({force: true}).type('-1', {force: true}))
        .then(() => cy.get('[data-cy="integer"]').click({force: true}))
        .then(() => cyHelp.forceChangeDetection())
        .then(() => {
          cy.get('mat-error').should('have.text', 'Please provide a positive number');
          cy.get(SELECTOR_editorSaveButton).should('be.disabled');
          cy.get(SELECTOR_editorCancelButton).click({force: true});
        });
    });

    it('can not enter incorrect value for integer', () => {
      cy.dbClickShape('Constraint2')
        .then(() => cy.get('[data-cy="integer"]').clear({force: true}).type('-1', {force: true}))
        .then(() => cy.get('[data-cy="scale"]').click({force: true}))
        .then(() => cyHelp.forceChangeDetection())
        .then(() => {
          cy.get('mat-error').should('have.text', 'Please provide a positive integer');
          cy.get(SELECTOR_editorSaveButton).should('be.disabled');
          cy.get(SELECTOR_editorCancelButton).click({force: true});
        });
    });

    it('can modify scale', () => {
      cy.dbClickShape('Constraint2')
        .then(() => cy.get('[data-cy="scale"]').clear({force: true}).type('10', {force: true}).click({force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:scale "10"^^xsd:positiveInteger');
          const label = cyHelp.getShapeLabelByKey('Constraint2', META_MODEL_scale);
          label.should('exist');
          label.should('contain.text', `${META_MODEL_scale} = 10`);
        });
    });
  });

  context('TestQuantifiable', () => {
    it('can add EncodingConstraint', () => {
      cy.clickAddTraitPlusIcon('TestQuantifiable')
        .then(() => cy.dbClickShape('Constraint3'))
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('EncodingConstraint').click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint3');
          expect(rdf).to.contain('Constraint3 a samm-c:EncodingConstraint');
          expect(rdf).to.contain('samm:value samm:US-ASCII');

          const label = cyHelp.getShapeLabelByKey('Constraint3', META_MODEL_value);
          label.should('exist');
          label.should('contain.text', `${META_MODEL_value} = US-ASCII`);
        });
    });
  });

  context('TestSet', () => {
    it('can add RegularExpressionConstraint', () => {
      cy.clickAddTraitPlusIcon('TestSet')
        .then(() => cy.dbClickShape('Constraint4'))
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('RegularExpressionConstraint').click({force: true});
        })
        .then(() => cy.get('[data-cy="value"]').type('*', {force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint4');
          expect(rdf).to.contain('Constraint4 a samm-c:RegularExpressionConstraint');
          expect(rdf).to.contain('samm:value "*"');

          const label = cyHelp.getShapeLabelByKey('Constraint4', META_MODEL_value);
          label.should('exist');
          label.should('contain.text', `${META_MODEL_value} = *`);
        });
    });
  });

  context('TestSortedSet', () => {
    it('can add RangeConstraint', () => {
      cy.clickAddTraitPlusIcon('TestSortedSet')
        .then(() => cy.dbClickShape('Constraint5'))
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('RangeConstraint').click({force: true});
          cy.get('[data-cy="maxValue"]').type('100', {force: true});
          cy.get('[data-cy="minValue"]').type('1', {force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint5');
          expect(rdf).to.contain('Constraint5 a samm-c:RangeConstraint');
          expect(rdf).to.contain('samm:value "*"');
          const minValue = cyHelp.getShapeLabelByKey('Constraint5', META_MODEL_minValue);
          minValue.should('exist');
          minValue.should('contain.text', `${META_MODEL_minValue} = 1`);

          const maxValue = cyHelp.getShapeLabelByKey('Constraint5', META_MODEL_maxValue);
          maxValue.should('exist');
          maxValue.should('contain.text', `${META_MODEL_maxValue} = 100`);
        });
    });
  });

  context('TestCollection', () => {
    it('can add LocaleConstraint', () => {
      cy.clickAddTraitPlusIcon('TestCollection')
        .then(() => cy.dbClickShape('Constraint6'))
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('LocaleConstraint').click({force: true});
          cy.get(FIELD_localeCode)
            .clear({force: true})
            .type('de-D', {force: true})
            .get('mat-option')
            .contains('de-DE')
            .click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint6');
          expect(rdf).to.contain('Constraint6 a samm-c:LocaleConstraint');
          expect(rdf).to.contain('samm-c:localeCode "de-DE"');

          const minValue = cyHelp.getShapeLabelByKey('Constraint6', META_MODEL_localeCode);
          minValue.should('exist');
          minValue.should('contain.text', `${META_MODEL_localeCode} = de-DE`);
        });
    });
  });

  context('TestDuration', () => {
    it('can add LanguageConstraint', () => {
      cy.clickAddTraitPlusIcon('TestDuration')
        .then(() => cy.dbClickShape('Constraint7'))
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('LanguageConstraint').click({force: true});
          cy.get(FIELD_languageCode)
            .clear({force: true})
            .type('English', {force: true})
            .get('mat-option')
            .contains('en')
            .click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint :Constraint7');
          expect(rdf).to.contain('Constraint7 a samm-c:LanguageConstraint');
          expect(rdf).to.contain('samm-c:languageCode "en"');

          const minValue = cyHelp.getShapeLabelByKey('Constraint7', META_MODEL_languageCode);
          minValue.should('exist');
          minValue.should('contain.text', `${META_MODEL_languageCode} = en`);
        });
    });
  });
});
