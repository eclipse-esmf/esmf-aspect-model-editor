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
  BUTTON_propConfig,
  FIELD_descriptionen,
  FIELD_error,
  FIELD_extends,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  META_MODEL_description,
  META_MODEL_preferredName,
  META_MODEL_see,
  SELECTOR_ecAbstractEntity,
  SELECTOR_ecAbstractProperty,
  SELECTOR_ecEntity,
  SELECTOR_editorCancelButton,
  SELECTOR_elementBtn,
  SELECTOR_notificationsBtn,
  SELECTOR_notificationsDialogCloseButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Create and Edit Abstract Entity', () => {
  describe('Edit abstract entity fields', () => {
    it('should add new abstract entity', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300))
        .then(() => cy.clickShape('AbstractEntity1'));
    });

    it('should check all edit fields', () => {
      cy.shapeExists('AbstractEntity1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_name).should('be.visible'))
        .then(() => cy.get(FIELD_preferredNameen).should('be.visible'))
        .then(() => cy.get(FIELD_descriptionen).should('be.visible'))
        .then(() => cy.get(FIELD_see).should('be.visible'))
        .then(() => cy.get(FIELD_extends).should('be.visible'))
        .then(() => cy.get(BUTTON_propConfig).should('be.visible'))
        .then(() => cyHelp.clickSaveButton());
    });

    it('should edit name field and check error', () => {
      cy.shapeExists('AbstractEntity1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_name).focus().clear().type('#newAbstractEntity'))
        .then(() => cy.get(FIELD_error).should('be.visible'))
        .then(() => cy.get(FIELD_name).clear())
        .then(() => cy.get(FIELD_name).clear().type('AbstractEntity1'))
        .then(() => cyHelp.clickSaveButton());
    });

    it('should edit preferred name field', () => {
      cy.shapeExists('AbstractEntity1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_preferredNameen).focus().clear().type('New preferred Name'))
        .then(() => cyHelp.clickSaveButton())
        .then(() =>
          cy.getCellLabel('AbstractEntity1', META_MODEL_preferredName).should('eq', `${META_MODEL_preferredName} = New preferred Name @en`),
        )
        .then(() => cy.getUpdatedRDF())
        .then(rdf => expect(rdf).to.contain('samm:preferredName "New preferred Name"@en'));
    });

    it('should edit abstract entity description', () => {
      cy.shapeExists('AbstractEntity1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_descriptionen).focus().clear().type('New description'))
        .then(() => cyHelp.clickSaveButton())
        .then(() =>
          cy.getCellLabel('AbstractEntity1', META_MODEL_description).should('eq', `${META_MODEL_description} = New description @en`),
        )
        .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:description "New description"@en')));
    });

    it('should edit see http attributes to urns', () => {
      cy.shapeExists('AbstractEntity1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.addSeeElements('urn:irdi:eclass:0173-1#02-AAO677', 'urn:irdi:iec:0112/2///62683#ACC011#001'))
        .then(() => cyHelp.clickSaveButton())
        .then(() =>
          cy
            .getCellLabel('AbstractEntity1', META_MODEL_see)
            .should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677,urn:irdi:iec:0112/2///62683#ACC011#001`),
        )
        .then(() => cy.getUpdatedRDF())
        .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>, <urn:irdi:iec:0112/2///62683#ACC011#001>'));

      cy.dbClickShape('AbstractEntity1')
        .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getCellLabel('AbstractEntity1', META_MODEL_see).should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677`))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>'));
    });
  });

  describe('Entity -> Abstract Entity', () => {
    it('should create', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.dragElement(SELECTOR_ecEntity, 350, 300).then(() => cy.clickShape('Entity1')));
    });

    it('should edit', () => {
      cy.dbClickShape('AbstractEntity1')
        .then(() => cy.get(FIELD_preferredNameen).focus().type('Preferred Name'))
        .then(() => cy.get(FIELD_descriptionen).focus().type('Description'))
        .then(() => cy.addSeeElements('http://test.com'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'Entity1'))
        .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name @en'))
        .then(() => cy.getCellLabel('Entity1', 'description').should('eq', 'Inherited\ndescription = Description @en'))
        .then(() => cy.getCellLabel('Entity1', 'see').should('eq', 'Inherited\nsee = http://test.com'));
    });

    it('should edit entity1', () => {
      cy.dbClickShape('Entity1')
        .then(() => cy.get(FIELD_descriptionen).clear({force: true}).type('Entity Description'))
        .then(() => cyHelp.clickSaveButton())
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
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity2'));
    });

    it('should reconnect to AbstractEntity1', () => {
      cy.then(() => cy.clickConnectShapes('Entity1', 'AbstractEntity1')).then(() =>
        cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity1'),
      );
    });
  });

  describe('Abstract Entity -> Abstract Entity', () => {
    it('should connect AbstractEntity1 to AbstractEntity2', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.get(SELECTOR_elementBtn).click())
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
        .then(() => cy.addSeeElements('http://test.com'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_preferredNameen).should('have.value', 'Preferred Name'))
        .then(() => cy.get(FIELD_descriptionen).should('have.value', 'Description'))
        .then(() => cy.get(`[data-cy="chip__http://test.com"] .chip-content`).should('contain.text', 'http://test.com'))
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('should not connect recursively', () => {
      cyHelp
        .clickShape('Characteristic1') // To lost focus on AbstractEntity2
        .then(() => cy.clickConnectShapes('AbstractEntity2', 'AbstractEntity1'))
        .then(() => cy.get(SELECTOR_notificationsBtn).click({force: true}))
        .then(() => cy.wait(500).get('.mat-mdc-cell').contains('Recursive elements').should('exist'))
        .then(() => cy.wait(500).get(SELECTOR_notificationsDialogCloseButton).click({force: true}));
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
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.dragElement(SELECTOR_ecAbstractProperty, 350, 300).then(() => cy.clickShape('abstractProperty1')));
    });

    it('should connect elements', () => {
      cy.clickConnectShapes('AbstractEntity1', 'abstractProperty1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-mdc-cell').should('contain', 'abstractProperty1'))
        .then(() => cy.get('.mat-mdc-cell').get('input').should('not.be.disabled'))
        .then(() => cy.wait(500).get('mat-dialog-container .close-button').click())
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
    });

    it('AbstractEntity2 should inherit abstractProperty1', () => {
      cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300)
        .then(() => cy.clickShape('AbstractEntity2'))
        .then(() => cy.clickConnectShapes('AbstractEntity2', 'AbstractEntity1'))
        .then(() => cy.dbClickShape('AbstractEntity2'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-mdc-cell').should('contain', 'abstractProperty1'))
        .then(() => cy.get('.mat-mdc-cell').get('input').should('be.disabled'))
        .then(() => cy.wait(500).get('mat-dialog-container .close-button').click());
    });
  });

  describe('Abstract Entity -> Property', () => {
    it('should create', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300))
        .then(() => cy.clickShape('AbstractEntity1'));
    });

    it('should connect elements', () => {
      cy.clickConnectShapes('AbstractEntity1', 'property1')
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-mdc-cell').should('contain', 'property1'))
        .then(() => cy.get('.mat-mdc-cell').get('input').should('not.be.disabled'))
        .then(() => cy.wait(500).get('mat-dialog-container .close-button').click())
        .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':AbstractEntity1 a samm:AbstractEntity;');
          expect(rdf).to.contain('samm:properties (:property1).');
        });
    });

    it('AbstractEntity2 should inherit property1', () => {
      cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300)
        .then(() => cy.clickShape('AbstractEntity2'))
        .then(() => cy.clickConnectShapes('AbstractEntity2', 'AbstractEntity1'))
        .then(() => cy.dbClickShape('AbstractEntity2'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get('.mat-mdc-cell').should('contain', 'property1'))
        .then(() => cy.get('.mat-mdc-cell').get('input').should('be.disabled'))
        .then(() => cy.wait(500).get('mat-dialog-container .close-button').click());
    });
  });

  describe('Abstract Entity import', () => {
    it('should import', () => {
      cy.visitDefault();
      cy.startModelling();
      cy.fixture('abstract-entity')
        .as('rdfString')
        .then(rdfString => cy.loadModel(rdfString))
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
      cy.startModelling()
        .wait(500)
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
        .then(() => cy.dragElement(SELECTOR_ecAbstractEntity, 350, 300).then(() => cy.clickShape('AbstractEntity1')))
        .then(() => cy.clickAddShapePlusIcon('AbstractEntity1'))
        .then(() => cy.clickAddShapePlusIcon('AbstractEntity1'))
        .then(() => cy.clickConnectShapes('AbstractEntity1', 'Entity1'))
        .then(() => cy.dbClickShape('AbstractEntity1'))
        .then(() => cy.get(FIELD_preferredNameen).type('Preferred Name 1', {force: true}))
        .then(() => cy.get(FIELD_descriptionen).type('Description 1', {force: true}))
        .then(() => cy.addSeeElements('http://test1.com'))
        .then(() => cyHelp.clickSaveButton().wait(500));

      cy.getCellLabel('Entity1', 'extends').should('eq', 'extends = AbstractEntity1');
      cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Preferred Name 1 @en');
      cy.getCellLabel('Entity1', 'description').should('eq', 'Inherited\ndescription = Description 1 @en');
      cy.getCellLabel('Entity1', 'see').should('eq', 'Inherited\nsee = http://test1.com');
    });

    it('should export', () => {
      cy.then(() => cy.getUpdatedRDF()).then(rdf => {
        expect(rdf).to.contain(':Entity1 a samm:Entity;');
        expect(rdf).to.contain(`[
  samm:characteristic :Characteristic2;
  samm:extends :abstractProperty1
]`);
        expect(rdf).to.contain(`[
  samm:characteristic :Characteristic3;
  samm:extends :abstractProperty2
]`);
        expect(rdf).to.contain('samm:extends :AbstractEntity1');
        expect(rdf).to.contain(':AbstractEntity1 a samm:AbstractEntity;');
        expect(rdf).to.contain('samm:properties (:abstractProperty1 :abstractProperty2);');
        expect(rdf).to.contain('samm:preferredName "Preferred Name 1"@en;');
        expect(rdf).to.contain('samm:description "Description 1"@en;');
        expect(rdf).to.contain('samm:see <http://test1.com>.');
      });
    });
  });
});
