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
  FIELD_characteristicName,
  FIELD_clearDataTypeBtn,
  FIELD_dataType,
  FIELD_dataTypeOption,
  FIELD_entityValueName,
  FIELD_name,
  FIELD_propertyLanguageValue,
  FIELD_propertyValueComplex,
  FIELD_propertyValueNotComplex,
  SELECTOR_addEntityValue,
  SELECTOR_clearEntityValueButton,
  SELECTOR_clearLanguageButton,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_entitySaveButton,
} from '../../../support/constants';
import {cyHelp} from '../../../support/helpers';
import {assertRdf, openElementAndAssertValues} from '../../../support/utils';

describe('Create and edit Entity value RDF lang string properties in edit view tests', () => {
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
  });

  it('should change entity values with rdf lang string property in on Collection', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_clearDataTypeBtn).click())
      .then(() => cy.get(FIELD_dataType).clear().type('NewEntity').get('.mat-mdc-option').contains('NewEntity').click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.shapeExists('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('property2'))
      .then(() => cy.clickAddShapePlusIcon('property3'))
      .then(() => cy.clickAddShapePlusIcon('property4'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic2'))
      .then(() => cy.dbClickShape('Characteristic3'))
      .then(() => cy.get(FIELD_dataType).clear().type('string').get(FIELD_dataTypeOption).eq(1).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic4'))
      .then(() => cy.get(FIELD_dataType).clear().type('langString').get(FIELD_dataTypeOption).eq(0).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click().get('mat-option').contains('Enumeration').click())
      .then(() => cy.get(SELECTOR_addEntityValue).click())
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev1'))
      .then(() =>
        cy.get(FIELD_propertyValueComplex).eq(0).should('exist').clear().type('ev2').get('.mat-mdc-option').contains('ev2').click(),
      )
      .then(() => cy.get('[data-cy="property3Value"]').should('exist').clear().type('ev3'))
      .then(() => cy.get('[data-cy="property4Value"]').should('exist').clear().type('ev4'))
      .then(() => cy.get(FIELD_propertyLanguageValue).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click())
      .then(() => cy.get(SELECTOR_entitySaveButton).click())
      .then(() => cy.wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('ev1'))
      .then(() => {
        cy.get(FIELD_propertyValueComplex).eq(0).should('have.value', 'ev2');
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('have.value', 'ev3');
        cy.get(FIELD_propertyValueNotComplex).eq(1).should('have.value', 'ev4');
        cy.get(FIELD_propertyLanguageValue).should('have.value', 'de');
      })
      .then(() => {
        cy.get(SELECTOR_clearEntityValueButton).click();
        cy.get(FIELD_propertyValueComplex).eq(0).should('exist').clear().type('ev5').get('.mat-mdc-option').contains('ev5').click();
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').clear().type('ev6');
        cy.get(FIELD_propertyValueNotComplex).eq(1).should('exist').clear().type('ev7');
        cy.get(SELECTOR_clearLanguageButton).click();
        cy.get(FIELD_propertyLanguageValue).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click();
      })
      .then(() => cy.get(SELECTOR_editorSaveButton).click());

    openElementAndAssertValues('Characteristic1', [
      {
        dataCy: 'ev1',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'property2', value: 'ev5'},
          {key: 'property3', value: 'ev6'},
          {key: 'property4  (en)', value: 'ev7'},
        ],
      },
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':ev5 a :Entity1.',
          ':ev1 a :NewEntity;',
          ':property2 :ev5;',
          ':property3 "ev6";',
          ':property4 "ev7"@en.',
          ':Characteristic2 a samm:Characteristic;',
          ':Characteristic3 a samm:Characteristic;',
          ':Characteristic4 a samm:Characteristic;',
        ],
      },
    ]);
  });

  it('should change entity values with rdf lang string property into two different Collection', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_clearDataTypeBtn).click())
      .then(() => cy.get(FIELD_dataType).clear().type('NewEntity').get('.mat-mdc-option').contains('NewEntity').click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.shapeExists('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('property2'))
      .then(() => cy.clickAddShapePlusIcon('property3'))
      .then(() => cy.clickAddShapePlusIcon('property4'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic2'))
      .then(() => cy.dbClickShape('Characteristic3'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Collection').click({force: true}))
      .then(() => cy.get(FIELD_dataType).clear().type('langString').get(FIELD_dataTypeOption).eq(0).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic4'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Collection').click({force: true}))
      .then(() => cy.get(FIELD_dataType).clear().type('langString').get(FIELD_dataTypeOption).eq(0).click())
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click().get('mat-option').contains('Enumeration').click())
      .then(() => cy.get(SELECTOR_addEntityValue).click())
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev1'))
      .then(() =>
        cy.get(FIELD_propertyValueComplex).eq(0).should('exist').clear().type('ev2').get('.mat-mdc-option').contains('ev2').click(),
      )
      .then(() => cy.get('[data-cy="property3Value"]').should('exist').clear().type('ev3'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(0).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="property3Add"]').click())
      .then(() => cy.get('[data-cy="property3Value"]').eq(1).should('exist').clear().type('ev4'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(1).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click(),
      )
      .then(() => cy.get('[data-cy="property4Value"]').should('exist').clear().type('ev5'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(2).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click(),
      )
      .then(() => cy.get('[data-cy="property4Add"]').click())
      .then(() => cy.get('[data-cy="property4Value"]').eq(1).should('exist').clear().type('ev6'))
      .then(() =>
        cy.get(FIELD_propertyLanguageValue).eq(3).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click(),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click().wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('ev1'))
      .then(() => {
        cy.get(FIELD_propertyValueComplex).eq(0).should('have.value', 'ev2');
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('have.value', 'ev3');
        cy.get(FIELD_propertyValueNotComplex).eq(1).should('have.value', 'ev4');
        cy.get(FIELD_propertyLanguageValue).eq(0).should('have.value', 'en');
        cy.get(FIELD_propertyLanguageValue).eq(1).should('have.value', 'de');
        cy.get(FIELD_propertyLanguageValue).eq(2).should('have.value', 'en');
        cy.get(FIELD_propertyLanguageValue).eq(3).should('have.value', 'de');
      })
      .then(() => {
        cy.get(SELECTOR_clearEntityValueButton).click();
        cy.get(FIELD_propertyValueComplex).eq(0).should('exist').clear().type('ev5').get('.mat-mdc-option').contains('ev5').click();
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').clear().type('ev6');
        cy.get(FIELD_propertyValueNotComplex).eq(1).should('exist').clear().type('ev7');
        cy.get(FIELD_propertyValueNotComplex).eq(2).should('exist').clear().type('ev8');
        cy.get(FIELD_propertyValueNotComplex).eq(3).should('exist').clear().type('ev9');
        cy.get(SELECTOR_clearLanguageButton).eq(0).click();
        cy.get(FIELD_propertyLanguageValue).eq(0).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click();
        cy.get(SELECTOR_clearLanguageButton).eq(1).click();
        cy.get(FIELD_propertyLanguageValue).eq(1).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click();
        cy.get(SELECTOR_clearLanguageButton).eq(2).click();
        cy.get(FIELD_propertyLanguageValue).eq(2).should('exist').clear().type('de').get('.mat-mdc-option').contains('de').click();
        cy.get(SELECTOR_clearLanguageButton).eq(3).click();
        cy.get(FIELD_propertyLanguageValue).eq(3).should('exist').clear().type('en').get('.mat-mdc-option').contains('en').click();
      })
      .then(() => cy.get(SELECTOR_editorSaveButton).click());

    openElementAndAssertValues('Characteristic1', [
      {
        dataCy: 'ev1',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'property2', value: 'ev5'},
          {key: 'property3  (de)', value: 'ev6'},
          {key: 'property3  (en)', value: 'ev7'},
          {key: 'property4  (de)', value: 'ev8'},
          {key: 'property4  (en)', value: 'ev9'},
        ],
      },
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':ev5 a :Entity1.',
          ':ev1 a :NewEntity;',
          ':property2 :ev5;',
          ':property3 ("ev6"@de "ev7"@en);',
          ':property4 ("ev8"@de "ev9"@en).',
          ':Characteristic2 a samm:Characteristic;',
          ':Characteristic3 a samm-c:Collection;',
          ':Characteristic4 a samm-c:Collection;',
        ],
      },
    ]);

    cy.dbClickShape('ev1')
      .then(() => {
        cy.get(FIELD_name).should('exist').clear().type('new');
        cy.get('[data-cy="property4Add"]').click();
        cy.get('[data-cy="property4Add"]').click();
        cy.get(FIELD_propertyValueNotComplex).eq(4).should('exist').clear().type('ev10');
        cy.get(FIELD_propertyLanguageValue).eq(4).should('exist').focus().clear().type('bm').get('.mat-mdc-option').contains('bm').click();
        cy.get(FIELD_propertyValueNotComplex).eq(5).should('exist').clear().type('ev11');
        cy.get(FIELD_propertyLanguageValue).eq(5).should('exist').focus().clear().type('en').get('.mat-mdc-option').contains('en').click();
        cy.get('[data-cy="property4Remove"]').eq(2).click();
      })
      .then(() => cy.get(SELECTOR_editorSaveButton).click());

    openElementAndAssertValues('Characteristic1', [
      {
        dataCy: 'new',
        expectedKeyValues: [
          {key: 'Property', value: 'Value'},
          {key: 'property2', value: 'ev5'},
          {key: 'property3  (de)', value: 'ev6'},
          {key: 'property3  (en)', value: 'ev7'},
          {key: 'property4  (de)', value: 'ev8'},
          {key: 'property4  (en)', value: 'ev9'},
          {key: 'property4  (bm)', value: 'ev10'},
        ],
      },
    ]);

    assertRdf([
      {
        rdfAssertions: [
          ':ev5 a :Entity1.',
          ':new a :NewEntity;',
          ':property2 :ev5;',
          ':property3 ("ev6"@de "ev7"@en);',
          ':property4 ("ev8"@de "ev9"@en "ev10"@bm).',
          ':Characteristic2 a samm:Characteristic;',
          ':Characteristic3 a samm-c:Collection;',
          ':Characteristic4 a samm-c:Collection;',
        ],
      },
    ]);
  });
});
