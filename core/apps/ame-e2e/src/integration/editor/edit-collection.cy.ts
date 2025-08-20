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
  FIELD_dataType,
  FIELD_elementCharacteristic,
  FIELD_name,
  SELECTOR_ecCharacteristic,
  SELECTOR_ecEntity,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';

describe('Test editing different Collections', () => {
  context('Type Collection', () => {
    it('can add new', () => {
      addNewTestingShape('Characteristic1', 'Collection');
    });

    it('connect new added new Characteristic', () => {
      addNewCharacteristic('Characteristic1');
    });

    it('connect new added Entity', () => {
      connectNewAddedEntity('Characteristic1');
    });

    it('can add Trait to Collection', () => {
      addTraitToCollection('Characteristic1');
    });

    it('can edit name of ElementCharacteristic Characteristic', () => {
      renameElementCharacteristicAsCharacteristic();
    });

    it('can edit name of Collection DataType', () => {
      renameCollectionDataType();
    });

    it('delete ElementCharacteristic DataType', () => {
      deleteCollectionDataType();
    });
  });

  context('Type List', () => {
    it('can add new', () => {
      addNewTestingShape('Characteristic1', 'List');
    });

    it('connect new added new Characteristic', () => {
      addNewCharacteristic('Characteristic1');
    });

    it('connect new added Entity', () => {
      connectNewAddedEntity('Characteristic1');
    });

    it('can add Constraint to List', () => {
      addTraitToCollection('Characteristic1');
    });

    it('can edit name of ElementCharacteristic Characteristic', () => {
      renameElementCharacteristicAsCharacteristic();
    });

    it('can edit name of Collection DataType', () => {
      renameCollectionDataType();
    });

    it('delete ElementCharacteristic DataType', () => {
      deleteCollectionDataType();
    });
  });

  context('Type Set', () => {
    it('can add new', () => {
      addNewTestingShape('Characteristic1', 'Set');
    });

    it('connect new added new Characteristic', () => {
      addNewCharacteristic('Characteristic1');
    });

    it('connect new added Entity', () => {
      connectNewAddedEntity('Characteristic1');
    });

    it('can add Constraint to Set', () => {
      addTraitToCollection('Characteristic1');
    });

    it('can edit name of ElementCharacteristic Characteristic', () => {
      renameElementCharacteristicAsCharacteristic();
    });

    it('can edit name of Collection DataType', () => {
      renameCollectionDataType();
    });

    it('delete ElementCharacteristic DataType', () => {
      deleteCollectionDataType();
    });
  });

  context('Type SortedSet', () => {
    it('can add new', () => {
      addNewTestingShape('Characteristic1', 'SortedSet');
    });

    it('connect new added new Characteristic', () => {
      addNewCharacteristic('Characteristic1');
    });

    it('connect new added Entity', () => {
      connectNewAddedEntity('Characteristic1');
    });

    it('can add Constraint to SortedSet', () => {
      addTraitToCollection('Characteristic1');
    });

    it('can edit name of ElementCharacteristic Characteristic', () => {
      renameElementCharacteristicAsCharacteristic();
    });

    it('can edit name of Collection DataType', () => {
      renameCollectionDataType();
    });

    it('delete ElementCharacteristic DataType', () => {
      deleteCollectionDataType();
    });
  });

  context('Type TimeSeries', () => {
    it('can add new', () => {
      addNewTestingShape('Characteristic1', 'TimeSeries');
    });

    it('connect new added new Characteristic', () => {
      addNewCharacteristic('Characteristic1');
    });

    it('connect new added Entity', () => {
      connectNewAddedEntity('Characteristic1');
    });

    it('can add Constraint to TimeSeries', () => {
      addTraitToCollection('Characteristic1');
    });

    it('can edit name of ElementCharacteristic Characteristic', () => {
      renameElementCharacteristicAsCharacteristic();
    });

    it('can edit name of Collection DataType', () => {
      renameCollectionDataType();
    });

    it('delete ElementCharacteristic DataType', () => {
      deleteCollectionDataType();
    });
  });

  const addNewTestingShape = (characteristic: string, type: string) => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains(`${type}`).click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(`samm:characteristic :${characteristic}`);
        expect(rdf).to.contain(`${characteristic} a samm-c:${type}`);
      })
      .then(() => cy.clickShape(characteristic))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.name).to.be.equal(characteristic);
      });
  };

  const addNewCharacteristic = (characteristic: string) => {
    cy.dragElement(SELECTOR_ecCharacteristic, 350, 300)
      .then(() => cy.dbClickShape(characteristic))
      .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_elementCharacteristic)
          .clear({force: true})
          .type('Characteristic2', {force: true})
          .get('mat-option')
          .contains('Characteristic2')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm-c:elementCharacteristic :Characteristic2'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.elementCharacteristic.name).to.equal('Characteristic2');
      });
  };

  const connectNewAddedEntity = (characteristic: string) => {
    cy.dragElement(SELECTOR_ecEntity, 350, 300)
      .then(() => cy.dbClickShape(characteristic))
      .then(() => cy.get('button[data-cy="clear-element-characteristic-button"]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_dataType)
          .clear({force: true})
          .type('Entity1', {force: true})
          .get('.mat-mdc-option')
          .contains('Entity1')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:dataType :Entity1'));
  };

  const addTraitToCollection = (characteristic: string) => {
    cy.clickAddTraitPlusIcon(characteristic)
      .then(() => cy.dbClickShape(characteristic))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Trait1 a samm-c:Trait');
        expect(rdf).to.contain(`samm-c:baseCharacteristic :${characteristic}`);
        expect(rdf).to.contain('samm-c:constraint :EncodingConstraint1');
        expect(rdf).to.contain('samm:characteristic :Trait1');
        expect(rdf).to.contain(':EncodingConstraint1 a samm-c:EncodingConstraint');
      })
      .then(() => cy.clickShape('EncodingConstraint1'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.name).to.equal('Trait1');
        expect(aspect.properties[0].characteristic.baseCharacteristic.name).to.equal(characteristic);
        expect(aspect.properties[0].characteristic.constraints[0].name).to.equal('EncodingConstraint1');
      });
  };

  const renameElementCharacteristicAsCharacteristic = () => {
    cy.shapeExists('Characteristic2')
      .then(() => cy.dbClickShape('Characteristic2'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewCharacteristic', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('NewCharacteristic a samm:Characteristic');
      });
  };

  const renameCollectionDataType = () => {
    cy.shapeExists('Entity1')
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewEntity', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:dataType :NewEntity');
        expect(rdf).to.contain('NewEntity a samm:Entity');
      });
  };

  const deleteCollectionDataType = () => {
    cy.shapeExists('NewEntity')
      .then(() => cy.clickShape('NewEntity'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).not.contain('NewEntity'));
  };
});
