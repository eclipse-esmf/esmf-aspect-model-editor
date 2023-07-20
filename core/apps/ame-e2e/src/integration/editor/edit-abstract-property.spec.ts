/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  FIELD_descriptionen,
  FIELD_preferredNameen,
  SELECTOR_dialogInputModel,
  SELECTOR_dialogStartButton,
  SELECTOR_ecAbstractProperty,
  SELECTOR_editorSaveButton,
  SELECTOR_tbLoadButton,
  SELECTOR_ecAbstractEntity,
  SELECTOR_ecProperty,
  SELECTOR_ecEntity,
  SELECTOR_editorCancelButton,
} from '../../support/constants';

describe('Create and Edit Abstract Property', () => {
  describe('Property -> Abstract Property', () => {
    it('should create', () => {
      cy.visitDefault();
      cy.startModelling().then(() => {
        cy.dragElement(SELECTOR_ecAbstractProperty, 350, 300).then(() => cy.clickShape('abstractProperty1'));
        cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1'));
      });
    });

    it('should edit', () => {
      cy.dbClickShape('abstractProperty1')
        .then(() => cy.get(FIELD_preferredNameen).focus().type('Preferred Name'))
        .then(() => cy.get(FIELD_descriptionen).focus().type('Description'))
        .then(() => cy.addSeeElements('http://test.com'))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}))
        .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
        .then(() => cy.clickAddShapePlusIcon('Entity1'))
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'abstractProperty1'))
        .then(() => cy.clickConnectShapes('abstractProperty1', 'property2'))
        .then(() => cy.getCellLabel('[abstractProperty1]', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name @en'))
        .then(() => cy.getCellLabel('[abstractProperty1]', 'description').should('eq', 'Inherited\ndescription = Description @en'))
        .then(() => cy.getCellLabel('[abstractProperty1]', 'see').should('eq', 'Inherited\nsee = http://test.com'));
    });
  });

  describe('Abstract Property import', () => {
    it('should import', () => {
      cy.visitDefault();
      cy.startModelling();
      cy.fixture('abstract-property')
        .as('rdfString')
        .then(rdfString => {
          cy.get(SELECTOR_tbLoadButton).click({force: true});
          cy.get('[data-cy="create-model"]').click({force: true});
          cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
        })
        .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
        .then(() => cy.clickShape('abstractProperty1'));
    });

    it('first property should have abstractProperty1 information', () => {
      cy.clickShape('[abstractProperty1]');
      cy.getCellLabel('[abstractProperty1]', 'extends').should('eq', 'extends = abstractProperty1');
      cy.getCellLabel('[abstractProperty1]', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name @ro');
      cy.getCellLabel('[abstractProperty1]', 'description').should('eq', 'Inherited\ndescription = Description @en');
      cy.getCellLabel('[abstractProperty1]', 'see').should('eq', 'Inherited\nsee = http://test.com');
    });

    it('second property should have abstractProperty3 information', () => {
      cy.clickShape('[abstractProperty2]');
      cy.getCellLabel('[abstractProperty2]', 'extends').should('eq', 'extends = abstractProperty2');
      cy.getCellLabel('[abstractProperty2]', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name @ro');
      cy.getCellLabel('[abstractProperty2]', 'description').should('eq', 'Inherited\ndescription = Description @en');
      cy.getCellLabel('[abstractProperty2]', 'see').should('eq', 'Inherited\nsee = http://test.com');
    });
  });

  describe('Abstract Property export', () => {
    it('should create model', () => {
      cy.visitDefault();
      cy.startModelling().then(() => {
        cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1'));
      });
      cy.clickAddShapePlusIcon('Characteristic1')
        .then(() => cy.clickAddShapePlusIcon('Entity1'))
        .then(() => cy.clickAddShapePlusIcon('Entity1'))
        .then(() => cy.dragElement(SELECTOR_ecAbstractProperty, 350, 300).then(() => cy.clickShape('abstractProperty1')))
        .then(() => cy.dragElement(SELECTOR_ecAbstractProperty, 350, 300).then(() => cy.clickShape('abstractProperty2')))

        .then(() => cy.clickConnectShapes('AbstractEntity1', 'abstractProperty1'))
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'abstractProperty2'))

        .then(() => cy.clickConnectShapes('property2', 'abstractProperty1'))
        .then(() => cy.clickConnectShapes('property3', 'abstractProperty2'))

        .then(() => cy.dbClickShape('abstractProperty1'))
        .then(() => cy.get(FIELD_preferredNameen).type('Preferred Name 1', {force: true}))
        .then(() => cy.get(FIELD_descriptionen).type('Description 1', {force: true}))
        .then(() => cy.addSeeElements('http://test1.com'))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}).wait(500))

        .then(() => cy.dbClickShape('abstractProperty2'))
        .then(() => cy.get(FIELD_preferredNameen).type('Preferred Name 2', {force: true}))
        .then(() => cy.get(FIELD_descriptionen).type('Description 2', {force: true}))
        .then(() => cy.addSeeElements('http://test2.com'))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}).wait(500));

      cy.getCellLabel('[abstractProperty1]', 'extends').should('eq', 'extends = abstractProperty1');
      cy.getCellLabel('[abstractProperty1]', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name 1 @en');
      cy.getCellLabel('[abstractProperty1]', 'description').should('eq', 'Inherited\ndescription = Description 1 @en');
      cy.getCellLabel('[abstractProperty1]', 'see').should('eq', 'Inherited\nsee = http://test1.com');

      cy.getCellLabel('[abstractProperty2]', 'extends').should('eq', 'extends = abstractProperty2');
      cy.getCellLabel('[abstractProperty2]', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name 2 @en');
      cy.getCellLabel('[abstractProperty2]', 'description').should('eq', 'Inherited\ndescription = Description 2 @en');
      cy.getCellLabel('[abstractProperty2]', 'see').should('eq', 'Inherited\nsee = http://test2.com');
    });

    it('should export', () => {
      cy.then(() => cy.getUpdatedRDF()).then(rdf => {
        expect(rdf).to.contain(`[ samm:extends :abstractProperty1 ]`);
        expect(rdf).to.contain(`[ samm:extends :abstractProperty2 ]`);
        expect(rdf).to.contain(
          `:abstractProperty1 a samm:AbstractProperty;\n    samm:preferredName "Preferred Name 1"@en;\n    samm:description "Description 1"@en;\n    samm:see <http://test1.com>.`
        );
        expect(rdf).to.contain(
          `:abstractProperty2 a samm:AbstractProperty;\n    samm:preferredName "Preferred Name 2"@en;\n    samm:description "Description 2"@en;\n    samm:see <http://test2.com>.`
        );
      });
    });
  });

  describe('Abstract Property can be connected to another shape only if it is connected to AbstractEntity', () => {
    it('should not be able to connect abstract property to a property', () => {
      cy.visitDefault();
      cy.startModelling().then(() => {
        cy.dragElement(SELECTOR_ecAbstractProperty, 350, 300).then(() => cy.clickShape('abstractProperty1'));
      });

      cy.dragElement(SELECTOR_ecProperty, 350, 300)
        .then(() => cy.clickShape('property1'))
        .then(() => cy.clickConnectShapes('property1', 'abstractProperty1'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).not.contain('samm:extends :abstractProperty1');
        });
    });

    it('should be able to connect abstract property to a property, if abstract property belongs to abstract entity', () => {
      cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300)
        .then(() => cy.clickShape('AbstractEntity1'))
        .then(() => cy.clickConnectShapes('abstractProperty1', 'AbstractEntity1'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).contain(':abstractProperty1 a samm:AbstractProperty');
        })
        .then(() => cy.clickShape('property1'));

      cy.dragElement(SELECTOR_ecEntity, 350, 300)
        .then(() => cy.clickShape('Entity1'))
        .then(() => cy.clickConnectShapes('property1', 'Entity1'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).contain('Entity1 a samm:Entity');
        });

      cy.clickConnectShapes('AbstractEntity1', 'Entity1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).contain('extends :abstractProperty1');
        });
    });
  });
});
