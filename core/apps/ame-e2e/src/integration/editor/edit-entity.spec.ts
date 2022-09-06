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

import {Aspect, DefaultEntity} from '@ame/meta-model';
import {SELECTOR_tbDeleteButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Entity', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => {
        cy.getAspect().then(aspect => {
          assert.isNotNull(aspect.properties[0].property.characteristic.dataType);
          expect(aspect.properties[0].property.characteristic.dataType.name).to.be.equal('Entity1');
        });
      });
  });

  it('can add properties', () => {
    cy.shapeExists('Entity1')
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.getAspect())
      .then(aspect => {
        const entity = aspect.properties[0].property.characteristic.dataType;
        expect(entity.properties).to.have.length(1);
        expect(entity.properties[0].property.name).to.be.equal('property2');
      });
    cy.getUpdatedRDF().then(rdf => {
      expect(rdf).to.contain('bamm:properties (:property2)');
      expect(rdf).to.contain(':property2 a bamm:Property');
    });
    cy.clickAddShapePlusIcon('Entity1').then(() => {
      cy.shapeExists('property3').then(() => {
        cy.getAspect().then(aspect => {
          const entity = aspect.properties[0].property.characteristic.dataType;
          expect(entity.properties).to.have.length(2);
          expect(entity.properties[1].property.name).to.be.equal('property3');
        });
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':property3 a bamm:Property');
          expect(rdf).to.contain('bamm:properties (:property2 :property3)');
        });
      });
    });
  });

  it('can connect', () => {
    cy.shapeExists('property3')
      .then(() => cy.clickShape('Characteristic1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => {
        cy.getUpdatedRDF().then(rdf1 => {
          expect(rdf1).not.contain(':Characteristic1');
          cy.clickAddShapePlusIcon('property1').then(() => {
            cy.clickConnectShapes('Characteristic1', 'Entity1');
            cy.getUpdatedRDF().then(rdf2 => {
              expect(rdf2).to.contain('bamm:dataType :Entity1');
              expect(rdf2).to.contain(':Entity1 a bamm:Entity');
            });
          });
        });
      });
  });

  it('can connect properties', () => {
    cy.shapeExists('Entity1')
      .then(() => cy.clickShape('Entity1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf1 => {
        expect(rdf1).not.contain(':Entity1');
        expect(rdf1).to.contain(':property2');
        expect(rdf1).to.contain(':property3');
        cy.clickAddShapePlusIcon('Characteristic1').then(() => {
          cy.clickConnectShapes('Entity1', 'property2');
          cy.clickConnectShapes('Entity1', 'property3');
          cy.getUpdatedRDF().then(rdf2 => {
            expect(rdf2).to.contain('bamm:dataType :Entity1');
            expect(rdf2).to.contain(':Entity1 a bamm:Entity');
            expect(rdf2).to.contain('bamm:properties (:property2 :property3)');
          });
        });
      });
  });

  it('can edit entity name', () => {
    cy.shapeExists('Entity1')
      .then(() => cyHelp.renameElement('Entity1', 'NewEntity'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':NewEntity');
          expect(rdf).to.contain(':NewEntity a bamm:Entity');
          expect(rdf).to.contain('bamm:properties (:property2 :property3)');
          cy.clickShape('NewEntity').then(shape => {
            assert.isNotNull(shape);
          });
          cy.getAspect().then(aspect => {
            expect(aspect.properties[0].property.characteristic.dataType.name).to.equal('NewEntity');
          });
        });
      });
  });

  it('can edit property name', () => {
    cy.shapeExists('property2')
      .then(() => cyHelp.renameElement('property2', 'newProperty2'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewEntity');
        expect(rdf).to.contain(':NewEntity a bamm:Entity');
        expect(rdf).to.contain('bamm:properties (:newProperty2 :property3)');
        cy.clickShape('NewEntity').then(shape => assert.isNotNull(shape));
        cy.getAspect().then(aspect =>
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.name).to.equal('newProperty2')
        );
      });
  });

  it('can edit entity and property name', () => {
    cy.shapeExists('NewEntity')
      .then(() => cyHelp.renameElement('NewEntity', 'NewEntity1'))
      .then(() => cy.wait(1000))
      .then(() => cyHelp.renameElement('property3', 'newProperty3'))
      .then(() => cy.wait(1000))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewEntity1');
        expect(rdf).to.contain(':NewEntity1 a bamm:Entity');
        expect(rdf).to.contain('bamm:properties (:newProperty2 :newProperty3)');
        cy.clickShape('NewEntity1').then(shape => {
          assert.isNotNull(shape);
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.name).to.equal('NewEntity1');
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.properties[0].property.name).to.equal('newProperty2');
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.dataType.properties[1].property.name).to.equal('newProperty3');
        });
      });
  });

  it('can delete existing', () => {
    cy.shapeExists('NewEntity1')
      .then(() => cy.clickShape('NewEntity1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => {
        cy.getAspect().then(aspect => {
          assert.isNull(aspect.properties[0].property.characteristic.dataType);
        });
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).not.contain('NewEntity1');
        });
      });
  });

  it('add new default entity rename it and add new default entity', () => {
    cy.clickAddShapePlusIcon('Characteristic1')
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property3'))
      .then(() => cyHelp.renameElement('Entity1', 'NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property4'))
      .then(() => cy.clickAddShapePlusIcon('property4'))
      .then(() => cy.shapeExists('Characteristic2'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic2'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property5'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property6'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(
            ':Entity1 a bamm:Entity;\n' + '    bamm:name "Entity1";\n' + '    bamm:properties (:property5 :property6).'
          );
          expect(rdf).to.contain(
            ':NewEntity a bamm:Entity;\n' + '    bamm:name "NewEntity";\n' + '    bamm:properties (:property2 :property3).'
          );
        });
      });
  });

  it('rename aspect and save model', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cyHelp.renameElement('AspectDefault', 'NewAspect'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(
            ':property1 a bamm:Property;\n' +
              '    bamm:name "property1";\n' +
              '    bamm:characteristic :Characteristic1.\n' +
              ':Characteristic1 a bamm:Characteristic;\n' +
              '    bamm:name "Characteristic1";\n' +
              '    bamm:dataType :NewEntity.\n' +
              ':Entity1 a bamm:Entity;\n' +
              '    bamm:name "Entity1";\n' +
              '    bamm:properties (:property5 :property6).\n' +
              ':property2 a bamm:Property;\n' +
              '    bamm:name "property2".\n' +
              ':property3 a bamm:Property;\n' +
              '    bamm:name "property3".\n' +
              ':NewEntity a bamm:Entity;\n' +
              '    bamm:name "NewEntity";\n' +
              '    bamm:properties (:property2 :property3).\n' +
              ':newProperty2 a bamm:Property;\n' +
              '    bamm:name "newProperty2".\n' +
              ':newProperty3 a bamm:Property;\n' +
              '    bamm:name "newProperty3".\n' +
              ':property4 a bamm:Property;\n' +
              '    bamm:name "property4";\n' +
              '    bamm:characteristic :Characteristic2.\n' +
              ':Characteristic2 a bamm:Characteristic;\n' +
              '    bamm:name "Characteristic2";\n' +
              '    bamm:dataType :Entity1.\n' +
              ':property5 a bamm:Property;\n' +
              '    bamm:name "property5".\n' +
              ':property6 a bamm:Property;\n' +
              '    bamm:name "property6".\n' +
              ':NewAspect a bamm:Aspect;\n' +
              '    bamm:name "NewAspect";\n' +
              '    bamm:properties (:property1 :property4);\n' +
              '    bamm:operations ();\n' +
              '    bamm:events ().'
          );
        });
      });
  });

  it('can delete existing properties', () => {
    cy.shapeExists('property2')
      .then(() => cy.clickShape('property2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.shapeExists('property3'))
      .then(() => cy.clickShape('property3'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.shapeExists('property5'))
      .then(() => cy.clickShape('property5'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.shapeExists('property6'))
      .then(() => cy.clickShape('property6'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(
            ':property1 a bamm:Property;\n' +
              '    bamm:name "property1";\n' +
              '    bamm:characteristic :Characteristic1.\n' +
              ':Characteristic1 a bamm:Characteristic;\n' +
              '    bamm:name "Characteristic1";\n' +
              '    bamm:dataType :NewEntity.\n' +
              ':Entity1 a bamm:Entity;\n' +
              '    bamm:name "Entity1";\n' +
              '    bamm:properties ().\n' +
              ':NewEntity a bamm:Entity;\n' +
              '    bamm:name "NewEntity";\n' +
              '    bamm:properties ().\n' +
              ':newProperty2 a bamm:Property;\n' +
              '    bamm:name "newProperty2".\n' +
              ':newProperty3 a bamm:Property;\n' +
              '    bamm:name "newProperty3".\n' +
              ':property4 a bamm:Property;\n' +
              '    bamm:name "property4";\n' +
              '    bamm:characteristic :Characteristic2.\n' +
              ':Characteristic2 a bamm:Characteristic;\n' +
              '    bamm:name "Characteristic2";\n' +
              '    bamm:dataType :Entity1.\n' +
              ':NewAspect a bamm:Aspect;\n' +
              '    bamm:name "NewAspect";\n' +
              '    bamm:properties (:property1 :property4);\n' +
              '    bamm:operations ();\n' +
              '    bamm:events ().'
          );
        });
      });
  });
});
