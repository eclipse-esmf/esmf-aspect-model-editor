/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />
import {cyHelp} from '../../support/helpers';
import {FIELD_characteristicName, SELECTOR_editorSaveButton, SELECTOR_tbDeleteButton} from '../../support/constants';

describe('Test create recursive element', () => {
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
    cy.getHTMLCell('Characteristic1')
      .should('be.visible')
      .then(() => cy.clickConnectShapes('Characteristic1', 'property2'))
      .then(() => cy.clickConnectShapes('Characteristic1', 'property3'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':property2 a bamm:Property;\n' + '    bamm:name "property2";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':property3 a bamm:Property;\n' + '    bamm:name "property3";\n' + '    bamm:characteristic :Characteristic1.'
        );
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.characteristic.name).to.equal(
            'Characteristic1'
          );
          expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.characteristic.name).to.equal(
            'Characteristic1'
          );
        });
        cyHelp.hasAddShapeOverlay('property2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('property3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('can edit entity name and properties name', () => {
    cy.getHTMLCell('Entity1')
      .should('be.visible')
      .then(() => cyHelp.renameElement('Entity1', 'NewEntity'))
      .then(() => cy.wait(1000))
      .then(() => cyHelp.renameElement('property3', 'newProperty3'))
      .then(() => cy.wait(1000))
      .then(() => cyHelp.renameElement('property2', 'newProperty2'))
      .then(() => cy.wait(1000))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewEntity');
        expect(rdf).to.contain(':NewEntity a bamm:Entity');
        expect(rdf).to.contain('bamm:properties (:newProperty2 :newProperty3)');
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
    cy.getHTMLCell('Characteristic1')
      .should('be.visible')
      .then(() => cyHelp.renameElement('Characteristic1', 'NewCharacteristic'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :NewCharacteristic.'
        );
        expect(rdf).to.contain(
          ':newProperty2 a bamm:Property;\n' + '    bamm:name "newProperty2";\n' + '    bamm:characteristic :NewCharacteristic.'
        );
        expect(rdf).to.contain(
          ':newProperty3 a bamm:Property;\n' + '    bamm:name "newProperty3";\n' + '    bamm:characteristic :NewCharacteristic.'
        );
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.characteristic.name).to.equal(
            'NewCharacteristic'
          );
          expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.characteristic.name).to.equal(
            'NewCharacteristic'
          );
        });
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('change characteristic type', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Text').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic bamm-c:MultiLanguageText.'
        );
        expect(rdf).to.contain(
          ':newProperty2 a bamm:Property;\n' + '    bamm:name "newProperty2";\n' + '    bamm:characteristic bamm-c:MultiLanguageText.'
        );
        expect(rdf).to.contain(
          ':newProperty3 a bamm:Property;\n' + '    bamm:name "newProperty3";\n' + '    bamm:characteristic bamm-c:MultiLanguageText.'
        );
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });

  it('add constraint to characteristic using trait with recursive properties', () => {
    cy.shapeExists('MultiLanguageText')
      .then(() => cy.dbClickShape('MultiLanguageText'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Characteristic').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.clickConnectShapes('Characteristic1', 'NewEntity'))
      .then(() => cy.clickConnectShapes('Characteristic1', 'newProperty2'))
      .then(() => cy.clickConnectShapes('Characteristic1', 'newProperty3'))
      .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Property1Trait.'
        );
        expect(rdf).to.contain(
          ':newProperty2 a bamm:Property;\n' + '    bamm:name "newProperty2";\n' + '    bamm:characteristic :Property1Trait.'
        );
        expect(rdf).to.contain(
          ':newProperty3 a bamm:Property;\n' + '    bamm:name "newProperty3";\n' + '    bamm:characteristic :Property1Trait.'
        );
        expect(rdf).to.contain(
          ':Property1Trait a bamm-c:Trait;\n' +
            '    bamm:name "Property1Trait";\n' +
            '    bamm-c:baseCharacteristic :Characteristic1;\n' +
            '    bamm-c:constraint :Constraint1.'
        );
        expect(rdf).to.contain(':Constraint1 a bamm:Constraint;\n' + '    bamm:name "Constraint1".');
        expect(rdf).to.contain(
          ':Characteristic1 a bamm:Characteristic;\n' + '    bamm:name "Characteristic1";\n' + '    bamm:dataType :NewEntity.'
        );
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
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':newProperty2 a bamm:Property;\n' + '    bamm:name "newProperty2";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':newProperty3 a bamm:Property;\n' + '    bamm:name "newProperty3";\n' + '    bamm:characteristic :Characteristic1.'
        );
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.characteristic.name).to.equal(
            'Characteristic1'
          );
          expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.characteristic.name).to.equal(
            'Characteristic1'
          );
        });
        cyHelp.hasAddShapeOverlay('newProperty2').then(addShapeIcon => expect(addShapeIcon).to.be.false);
        cyHelp.hasAddShapeOverlay('newProperty3').then(addShapeIcon => expect(addShapeIcon).to.be.false);
      });
  });
});
