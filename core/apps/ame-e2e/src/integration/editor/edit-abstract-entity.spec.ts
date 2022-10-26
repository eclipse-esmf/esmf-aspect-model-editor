/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
  FIELD_extends,
  FIELD_preferredNameen,
  FIELD_see,
  SELECTOR_dialogInputModel,
  SELECTOR_dialogStartButton,
  SELECTOR_ecAbstractEntity,
  SELECTOR_ecAbstractProperty,
  SELECTOR_ecEntity,
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
  SELECTOR_notificationsButton,
  SELECTOR_tbDeleteButton,
  SELECTOR_tbLoadButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Create and Edit Abstract Entity', () => {
  describe('Entity -> Abstract Entity', () => {
    it('should create', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.dragElement(SELECTOR_ecEntity, 350, 300).then(() => cy.clickShape('Entity1')));
    });

    it('should edit', () => {
      cy.dbClickShape('AbstractEntity1')
        .then(() => cy.get(FIELD_preferredNameen).focus().type('Preferred Name'))
        .then(() => cy.get(FIELD_descriptionen).focus().type('Description'))
        .then(() => cy.get(FIELD_see).focus().type('http://test.com'))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}))
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'Entity1'))
        .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name @en'))
        .then(() => cy.getCellLabel('Entity1', 'description').should('eq', 'Inherited\ndescription = Description @en'))
        .then(() => cy.getCellLabel('Entity1', 'see').should('eq', 'Inherited\nsee = http://test.com'));
    });

    it('should edit entity1', () => {
      cy.dbClickShape('Entity1')
        .then(() => cy.get(FIELD_descriptionen).clear({force: true}).type('Entity Description'))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}))
        .then(() => cy.getCellLabel('Entity1', 'description').should('eq', 'description = Entity Description @en'))
        .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name @en'))
        .then(() => cy.getCellLabel('Entity1', 'see').should('eq', 'Inherited\nsee = http://test.com'));
    });

    it('should connect to AbstractEntity2', () => {
      cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300)
        .then(() => cy.clickShape('AbstractEntity2'))
        .then(() => cy.dbClickShape('Entity1'))
        .then(() => cy.get('[data-cy="clear-extends-button"]').click({force: true}))
        .then(() => cy.get(FIELD_extends).focus().type('AbstractEntity2'))
        .then(() => cy.get('mat-option').contains('AbstractEntity2').first().click({force: true}))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}))
        .then(() => cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity2'));
    });

    it('should reconnect to AbstractEntity1', () => {
      cy.then(() => cy.clickConnectShapes('Entity1', 'AbstractEntity1')).then(() =>
        cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity1')
      );
    });
  });

  describe('Abstract Entity -> Abstract Entity', () => {
    it('should connect AbstractEntity1 to AbstractEntity2', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity2')))
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'AbstractEntity2'))
        .then(() => cy.get('[data-cy="formatButton"]').click({force: true}).wait(200))
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_extends).should('have.value', 'AbstractEntity2'))
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('AbstractEntity1 should have AbstractEntity2 values', () => {
      cy.clickShape('AbstractEntity2')
        .dbClickShape('AbstractEntity2')
        .then(() => cy.get(FIELD_preferredNameen).focus().type('Preferred Name'))
        .then(() => cy.get(FIELD_descriptionen).focus().type('Description'))
        .then(() => cy.get(FIELD_see).focus().type('http://test.com'))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}))
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_preferredNameen).should('have.value', 'Preferred Name'))
        .then(() => cy.get(FIELD_descriptionen).should('have.value', 'Description'))
        .then(() => cy.get(FIELD_see).should('have.value', 'http://test.com'))
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('should not connect recursively', () => {
      cyHelp
        .clickShape('Characteristic1') // To lost focus on AbstractEntity2
        .then(() => cy.clickConnectShapes('AbstractEntity2', 'AbstractEntity1'))
        .then(() => cy.get(SELECTOR_notificationsButton).click({force: true}))
        .then(() => cy.wait(500).get('.mat-cell').contains('Recursive elements').should('exist'))
        .then(() => cy.wait(500).get('[data-cy="close-notifications"]').click({force: true}));
    });

    it('AbstractEntity1 should not have AbstractEntity2 values anymore', () => {
      cy.clickShape('AbstractEntity2')
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.clickShape('AbstractEntity1').dbClickShape('AbstractEntity1').wait(500))
        .then(() => cy.get(FIELD_preferredNameen).should('have.value', ''))
        .then(() => cy.get(FIELD_descriptionen).should('have.value', ''))
        .then(() => cy.get(FIELD_see).should('have.value', ''))
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('should create abstract properties', () => {
      cy.clickAddShapePlusIcon('AbstractEntity1')
        .then(() => cy.clickAddShapePlusIcon('AbstractEntity1'))
        .then(() => cy.clickShape('abstractProperty1'))
        .then(() => cy.clickShape('abstractProperty2'));
    });
  });

  describe('Abstract Entity -> Abstract Property', () => {
    it('should create', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.dragElement(SELECTOR_ecAbstractProperty, 350, 300).then(() => cy.clickShape('abstractProperty1')));
    });

    it('should connect elements', () => {
      cy.clickConnectShapes('AbstractEntity1', 'abstractProperty1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-cell').should('contain', 'abstractProperty1'))
        .then(() => cy.get('.mat-cell').get('input').should('not.be.disabled'))
        .then(() => cy.wait(500).get('.mat-dialog-container .close-button').click())
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('AbstractEntity2 should inherit abstractProperty1', () => {
      cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300)
        .then(() => cy.clickShape('AbstractEntity2'))
        .then(() => cy.clickConnectShapes('AbstractEntity2', 'AbstractEntity1'))
        .then(() => cy.dbClickShape('AbstractEntity2'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-cell').should('contain', 'abstractProperty1'))
        .then(() => cy.get('.mat-cell').get('input').should('be.disabled'))
        .then(() => cy.wait(500).get('.mat-dialog-container .close-button').click());
    });
  });

  describe('Abstract Entity -> Property', () => {
    it('should create', () => {
      cy.visitDefault();
      cy.startModelling().then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')));
    });

    it('should connect elements', () => {
      cy.clickConnectShapes('AbstractEntity1', 'property1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-cell').should('contain', 'property1'))
        .then(() => cy.get('.mat-cell').get('input').should('not.be.disabled'))
        .then(() => cy.wait(500).get('.mat-dialog-container .close-button').click())
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('AbstractEntity2 should inherit property1', () => {
      cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300)
        .then(() => cy.clickShape('AbstractEntity2'))
        .then(() => cy.clickConnectShapes('AbstractEntity2', 'AbstractEntity1'))
        .then(() => cy.dbClickShape('AbstractEntity2'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-cell').should('contain', 'property1'))
        .then(() => cy.get('.mat-cell').get('input').should('be.disabled'))
        .then(() => cy.wait(500).get('.mat-dialog-container .close-button').click());
    });
  });

  describe('Abstract Entity import', () => {
    it('should import', () => {
      cy.visitDefault();
      cy.startModelling();
      cy.fixture('abstract-entity')
        .as('rdfString')
        .then(rdfString => {
          cy.get(SELECTOR_tbLoadButton).click({force: true});
          cy.get('[data-cy="create-model"]').click({force: true});
          cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
        })
        .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
        .then(() => cy.clickShape('AbstractEntity1'));
    });

    it('Entity should have Abstract Entity information', () => {
      cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity1');
      cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name 1 @en');
      cy.getCellLabel('Entity1', 'description').should('eq', 'Inherited\ndescription = Description 1 @en');
      cy.getCellLabel('Entity1', 'see').should('eq', 'Inherited\nsee = http://test1.com');
    });
  });

  describe('Abstract Entity export', () => {
    it('should create model', () => {
      cy.visitDefault();
      cy.startModelling();
      cy.clickAddShapePlusIcon('Characteristic1')
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.clickAddShapePlusIcon('AbstractEntity1'))
        .then(() => cy.clickAddShapePlusIcon('AbstractEntity1'))
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'Entity1'))

        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_preferredNameen).type('Preferred Name 1', {force: true}))
        .then(() => cy.get(FIELD_descriptionen).type('Description 1', {force: true}))
        .then(() => cy.get(FIELD_see).type('http://test1.com', {force: true}))
        .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}).wait(500));

      cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity1');
      cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name 1 @en');
      cy.getCellLabel('Entity1', 'description').should('eq', 'Inherited\ndescription = Description 1 @en');
      cy.getCellLabel('Entity1', 'see').should('eq', 'Inherited\nsee = http://test1.com');
    });

    it('should export', () => {
      cy.then(() => cy.getUpdatedRDF()).then(rdf => {
        console.log(rdf);
        expect(rdf).to.contain(
          `:Entity1 a bamm:Entity;\n    bamm:properties ([ bamm:extends :abstractProperty1 ] [ bamm:extends :abstractProperty2 ]);\n    bamm:extends :AbstractEntity1.`
        );
        expect(rdf).to.contain(
          `:AbstractEntity1 a bamm:AbstractEntity;\n` +
            `    bamm:properties (:abstractProperty1 :abstractProperty2);\n    bamm:preferredName "Preferred Name 1"@en;\n` +
            `    bamm:description "Description 1"@en;\n    bamm:see <http://test1.com>.`
        );
      });
    });
  });
});
