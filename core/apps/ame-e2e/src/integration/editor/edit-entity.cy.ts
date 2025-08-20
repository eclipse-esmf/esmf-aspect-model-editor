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
  FIELD_descriptionen,
  FIELD_extends,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  META_MODEL_description,
  META_MODEL_preferredName,
  SELECTOR_configureProp,
  SELECTOR_elementBtn,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Entity', () => {
  it('should add new entity', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => {
        cy.getAspect().then(aspect => {
          assert.isNotNull(aspect.properties[0].characteristic.dataType);
          expect(aspect.properties[0].characteristic.dataType.name).to.be.equal('Entity1');
        });
      });
  });

  it('should add properties', () => {
    cy.shapeExists('Entity1')
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.getAspect())
      .then(aspect => {
        const entity = aspect.properties[0].characteristic.dataType;
        expect(entity.properties).to.have.length(1);
        expect(entity.properties[0].name).to.be.equal('property2');
      });
    cy.getUpdatedRDF().then(rdf => {
      expect(rdf).to.contain('samm:properties (:property2)');
      expect(rdf).to.contain(':property2 a samm:Property');
    });
    cy.clickAddShapePlusIcon('Entity1').then(() => {
      cy.shapeExists('property3').then(() => {
        cy.getAspect().then(aspect => {
          const entity = aspect.properties[0].characteristic.dataType;
          expect(entity.properties).to.have.length(2);
          expect(entity.properties[1].name).to.be.equal('property3');
        });
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':property3 a samm:Property');
          expect(rdf).to.contain('samm:properties (:property2 :property3)');
        });
      });
    });
  });

  it('should connect', () => {
    cy.shapeExists('property3')
      .then(() => cy.clickShape('Characteristic1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => {
        cy.getUpdatedRDF().then(rdf1 => {
          expect(rdf1).not.contain(':Characteristic1');
          cy.clickAddShapePlusIcon('property1').then(() => {
            cy.clickConnectShapes('Characteristic1', 'Entity1');
            cy.getUpdatedRDF().then(rdf2 => {
              expect(rdf2).to.contain('samm:dataType :Entity1');
              expect(rdf2).to.contain(':Entity1 a samm:Entity');
            });
          });
        });
      });
  });

  it('should connect properties', () => {
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
            expect(rdf2).to.contain('samm:dataType :Entity1');
            expect(rdf2).to.contain(':Entity1 a samm:Entity');
            expect(rdf2).to.contain('samm:properties (:property2 :property3)');
          });
        });
      });
  });

  it('should edit entity name', () => {
    cy.shapeExists('Entity1')
      .then(() => cyHelp.renameElement('Entity1', 'NewEntity'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':NewEntity');
          expect(rdf).to.contain(':NewEntity a samm:Entity');
          expect(rdf).to.contain('samm:properties (:property2 :property3)');
          cy.clickShape('NewEntity').then(shape => {
            assert.isNotNull(shape);
          });
          cy.getAspect().then(aspect => {
            expect(aspect.properties[0].characteristic.dataType.name).to.equal('NewEntity');
          });
        });
      });
  });

  it('should validate name', () => {
    cy.shapeExists('NewEntity')
      .then(() => cy.dbClickShape('NewEntity'))
      .then(() => {
        cy.get(FIELD_name).should('be.visible').click();
        cy.get(FIELD_name).clear().type('entity23$%$');
        cy.get('ame-name-input-field mat-error').should(
          'contain',
          'Please start with an upper case character followed by letters/numerals.',
        );
      })
      .then(() => cy.get(FIELD_name).clear())
      .then(() => cy.get(FIELD_name).clear().type('NewEntity'));
  });

  it('should check that all fields are visible and the order is correct', () => {
    cy.shapeExists('NewEntity')
      .then(() => cy.dbClickShape('NewEntity'))
      .then(() => cy.get(FIELD_name).should('be.visible'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for entity'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('This is an entity'))
      .then(() => cy.get(FIELD_see).should('be.visible'))
      .then(() => cy.get(FIELD_extends).should('be.visible'))
      .then(() => cy.get(SELECTOR_configureProp).should('be.visible').should('have.text', 'Configure'))
      .then(() => cyHelp.clickSaveButton());
  });

  it('should check incoming and outgoing edges', () => {
    cy.shapeExists('NewEntity').then(() => cy.dbClickShape('NewEntity'));
    cy.contains('Incoming edges (1)').should('exist');
    cy.contains('Outgoing edges (2)').should('exist');
  });

  it('should edit preferredName', () => {
    cy.shapeExists('NewEntity')
      .then(() => cy.dbClickShape('NewEntity'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for entity'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('NewEntity', META_MODEL_preferredName)
          .should('eq', `${META_MODEL_preferredName} = New Preffered Name for entity @en`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:preferredName "New Preffered Name for entity"@en'));
  });

  it('should edit description', () => {
    cy.shapeExists('NewEntity')
      .then(() => cy.dbClickShape('NewEntity'))
      .then(() => cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the entity', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy.getCellLabel('NewEntity', META_MODEL_description).should('eq', `${META_MODEL_description} = New description for the entity @en`),
      )
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:description "New description for the entity"@en')))
      .then(() =>
        cy
          .getAspect()
          .then(aspect =>
            expect(aspect.properties[0].characteristic.dataType.getDescription('en')).to.equal('New description for the entity'),
          ),
      );
  });

  it('should edit property name', () => {
    cy.shapeExists('property2')
      .then(() => cyHelp.renameElement('property2', 'newProperty2'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewEntity');
        expect(rdf).to.contain(':NewEntity a samm:Entity');
        expect(rdf).to.contain('samm:properties (:newProperty2 :property3)');
        cy.clickShape('NewEntity').then(shape => assert.isNotNull(shape));
        cy.getAspect().then(aspect => expect(aspect.properties[0].characteristic.dataType.properties[0].name).to.equal('newProperty2'));
      });
  });

  it('should edit entity and property name', () => {
    cy.shapeExists('NewEntity')
      .then(() => cyHelp.renameElement('NewEntity', 'NewEntity1'))
      .then(() => cyHelp.renameElement('property3', 'newProperty3'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewEntity1');
        expect(rdf).to.contain(':NewEntity1 a samm:Entity');
        expect(rdf).to.contain('samm:properties (:newProperty2 :newProperty3)');
        cy.clickShape('NewEntity1').then(shape => {
          assert.isNotNull(shape);
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].characteristic.dataType.name).to.equal('NewEntity1');
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].characteristic.dataType.properties[0].name).to.equal('newProperty2');
        });
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].characteristic.dataType.properties[1].name).to.equal('newProperty3');
        });
      });
  });

  it('should delete existing entity', () => {
    cy.shapeExists('NewEntity1')
      .then(() => cy.clickShape('NewEntity1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.clickShape('newProperty2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.clickShape('newProperty3'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.clickShape('Characteristic2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => cy.clickShape('Characteristic3'))
      .then(() => cy.get(SELECTOR_tbDeleteButton))
      .click({force: true})
      .then(() => {
        cy.getAspect().then(aspect => {
          assert.isNull(aspect.properties[0].characteristic.dataType);
        });
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).not.contain('NewEntity1');
        });
      });
  });

  it('should add new default entity, rename it and add new default entity', () => {
    cy.clickAddShapePlusIcon('Characteristic1')
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property3'))
      .then(() => cyHelp.renameElement('Entity1', 'NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property4'))
      .then(() => cy.shapeExists('Characteristic4'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic4'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property5'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property6'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':Entity1 a samm:Entity;\n' + '    samm:properties (:property5 :property6).');
          expect(rdf).to.contain(':NewEntity a samm:Entity;\n' + '    samm:properties (:property2 :property3).');
        });
      });
  });

  it('should rename aspect and save model', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cyHelp.renameElement('AspectDefault', 'NewAspect'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(`:property1 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic1.`);
          expect(rdf).to.contain(`:Characteristic1 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType :NewEntity.`);
          expect(rdf).to.contain(`:property4 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic4.`);
          expect(rdf).to.contain(`:NewEntity a samm:Entity;`);
          expect(rdf).to.contain(`samm:properties (:property2 :property3).`);
          expect(rdf).to.contain(`:property2 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic2.`);
          expect(rdf).to.contain(`:property3 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic3.`);
          expect(rdf).to.contain(`:Characteristic2 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:Characteristic3 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:Characteristic4 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType :Entity1.`);
          expect(rdf).to.contain(`:Entity1 a samm:Entity;`);
          expect(rdf).to.contain(`samm:properties (:property5 :property6).`);
          expect(rdf).to.contain(`:property5 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic5.`);
          expect(rdf).to.contain(`:property6 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic6.`);
          expect(rdf).to.contain(`:Characteristic5 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:Characteristic6 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:NewAspect a samm:Aspect;`);
          expect(rdf).to.contain(`samm:properties (:property1 :property4);`);
          expect(rdf).to.contain(`samm:operations ();`);
          expect(rdf).to.contain(`samm:events ().`);
        });
      });
  });

  it('should delete existing properties', () => {
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
          expect(rdf).to.contain(`:property1 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic1.`);
          expect(rdf).to.contain(`:Characteristic1 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType :NewEntity.`);
          expect(rdf).to.contain(`:property4 a samm:Property;`);
          expect(rdf).to.contain(`samm:characteristic :Characteristic4.`);
          expect(rdf).to.contain(`:NewEntity a samm:Entity;`);
          expect(rdf).to.contain(`samm:properties ().`);
          expect(rdf).to.contain(`:Characteristic2 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:Characteristic3 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:Characteristic4 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType :Entity1.`);
          expect(rdf).to.contain(`:Entity1 a samm:Entity;`);
          expect(rdf).to.contain(`samm:properties ().`);
          expect(rdf).to.contain(`:Characteristic5 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:Characteristic6 a samm:Characteristic;`);
          expect(rdf).to.contain(`samm:dataType xsd:string.`);
          expect(rdf).to.contain(`:NewAspect a samm:Aspect;`);
          expect(rdf).to.contain(`samm:properties (:property1 :property4);`);
          expect(rdf).to.contain(`samm:operations ();`);
          expect(rdf).to.contain(`samm:events ().`);
        });
      });
  });
});
