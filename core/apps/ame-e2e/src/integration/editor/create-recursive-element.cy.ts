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
import {FIELD_characteristicName, SELECTOR_tbDeleteButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test create recursive element', () => {
  function checkIfAspectHasCharacteristic(aspect) {
    expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.characteristic.name).to.equal('Characteristic1');
    expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.characteristic.name).to.equal('Characteristic1');
  }

  it('can add new element', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property3'));
  });

  it('can connect recursive elements', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.clickConnectShapes('Characteristic1', 'property2'))
      .then(() => cy.clickConnectShapes('Characteristic1', 'property3'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':property2 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':property3 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        cy.getAspect().then(checkIfAspectHasCharacteristic);
        cyHelp.hasAddShapeOverlay('property2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('property3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('can edit entity name and properties name', () => {
    cy.shapeExists('Entity1')
      .then(() => cyHelp.renameElement('Entity1', 'NewEntity'))
      .then(() => cyHelp.renameElement('property3', 'newProperty3'))
      .then(() => cyHelp.renameElement('property2', 'newProperty2'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewEntity');
        expect(rdf).to.contain(':NewEntity a samm:Entity');
        expect(rdf).to.contain('samm:properties (:newProperty2 :newProperty3)');
        cy.clickShape('NewEntity').then(shape => {
          assert.isNotNull(shape);
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.name).to.equal('NewEntity');
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.name).to.equal('newProperty2');
          expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.name).to.equal('newProperty3');
        });
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('can edit characteristic name with same recursive properties', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cyHelp.renameElement('Characteristic1', 'NewCharacteristic'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :NewCharacteristic.');
        expect(rdf).to.contain(':newProperty2 a samm:Property;\n' + '    samm:characteristic :NewCharacteristic.');
        expect(rdf).to.contain(':newProperty3 a samm:Property;\n' + '    samm:characteristic :NewCharacteristic.');
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('NewCharacteristic');
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.characteristic.name).to.equal(
            'NewCharacteristic',
          );
          expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.characteristic.name).to.equal(
            'NewCharacteristic',
          );
        });
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('change characteristic type', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Code').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewCharacteristic a samm-c:Code');
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :NewCharacteristic.');
        expect(rdf).to.contain(':newProperty2 a samm:Property;\n' + '    samm:characteristic :NewCharacteristic.');
        expect(rdf).to.contain(':newProperty3 a samm:Property;\n' + '    samm:characteristic :NewCharacteristic.');
        cyHelp.hasAddShapeOverlay('property1').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('add constraint to characteristic using trait with recursive properties', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Characteristic').click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.clickConnectShapes('NewCharacteristic', 'NewEntity'))
      .then(() => cy.clickConnectShapes('NewCharacteristic', 'newProperty2'))
      .then(() => cy.clickConnectShapes('NewCharacteristic', 'newProperty3'))
      .then(() => cy.clickAddTraitPlusIcon('NewCharacteristic'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Property1Trait.');
        expect(rdf).to.contain(':newProperty2 a samm:Property;\n' + '    samm:characteristic :Property1Trait.');
        expect(rdf).to.contain(':newProperty3 a samm:Property;\n' + '    samm:characteristic :Property1Trait.');
        expect(rdf).to.contain(
          ':Property1Trait a samm-c:Trait;\n' +
            '    samm-c:baseCharacteristic :NewCharacteristic;\n' +
            '    samm-c:constraint :Constraint1.',
        );
        expect(rdf).to.contain(':Constraint1 a samm:Constraint.\n');
        expect(rdf).to.contain(':NewCharacteristic a samm:Characteristic;\n' + '    samm:dataType :NewEntity.');
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('delete characteristic constraint with recursive properties', () => {
    cy.shapeExists('Constraint1')
      .then(() => cy.clickShape('Constraint1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a samm:Property;\n');
        expect(rdf).to.contain(':newProperty2 a samm:Property;\n');
        expect(rdf).to.contain(':newProperty3 a samm:Property;\n');
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });
});
