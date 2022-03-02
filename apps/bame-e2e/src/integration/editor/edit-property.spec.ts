/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {FIELD_name, FIELD_notInPayload, FIELD_optional, FIELD_payloadName, SELECTOR_editorSaveButton} from '../../support/constants';

// These tests are for the special case that the name of the shape is changed and the turtle file is generated correctly.
describe('Test edit property', () => {
  it('rename first property and new property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:test :property1)');
        expect(rdf).to.contain(':test a bamm:Property;');
        expect(rdf).to.contain(':property1 a bamm:Property');
      });
  });

  it('rename first property and rename new added property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test1');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      // Shape is not yet synced, so you cannot search for the name
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test2');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:test1 :test2)');
        expect(rdf).to.contain(':test1 a bamm:Property;');
        expect(rdf).to.contain(':test2 a bamm:Property');
      });
  });

  it('rename first property and rename second added second property and add new default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test1');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      // Shape is not yet synced, so you cannot search for the name
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test2');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:test1 :test2 :property1)');
        expect(rdf).to.contain(':test1 a bamm:Property;');
        expect(rdf).to.contain(':test2 a bamm:Property');
        expect(rdf).to.contain(':property1 a bamm:Property');
      });
  });

  it('rename property and rename second added property and rename third added default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test1');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test2');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('test3');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:test1 :test2 :test3)');
        expect(rdf).to.contain(':test1 a bamm:Property;');
        expect(rdf).to.contain(':test2 a bamm:Property');
        expect(rdf).to.contain(':test3 a bamm:Property');
      });
  });

  it('should not permit to put 2 properties with the same name', () => {
    cy.visitDefault();
    cy.startModelling()
      // create a
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('a');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // create b
      .then(() => cy.wait(1000))
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('b');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename a to z
      .then(() => cy.wait(1000))
      .then(() => cy.dbClickShape('a'))
      .then(() => {
        cy.get(FIELD_name).clear().type('z');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename b to a
      .then(() => cy.wait(1000))
      .then(() => cy.dbClickShape('b'))
      .then(() => {
        cy.get(FIELD_name).clear().type('a');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename z to b
      .then(() => cy.wait(1000))
      .then(() => cy.dbClickShape('z'))
      .then(() => {
        cy.get(FIELD_name).clear().type('b');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename b to a
      .then(() => cy.wait(1000))
      .then(() => cy.dbClickShape('b'))
      .then(() => {
        cy.get(FIELD_name).clear().type('a');
        return cy.get(SELECTOR_editorSaveButton).should('be.disabled');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:b :a)');
        expect(rdf).to.contain(':a a bamm:Property;');
        expect(rdf).to.contain(':b a bamm:Property');
      });
  });

  it('rename aspect after rename property and create new default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('newProperty');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('AspectDefault'))
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear().type('NewAspect'))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' +
            '    bamm:name "property1".\n' +
            ':Characteristic1 a bamm:Characteristic;\n' +
            '    bamm:name "Characteristic1";\n' +
            '    bamm:dataType xsd:string.\n' +
            ':NewAspect a bamm:Aspect;\n' +
            '    bamm:name "NewAspect";\n' +
            '    bamm:properties (:newProperty :property1);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().\n' +
            ':newProperty a bamm:Property;\n' +
            '    bamm:name "newProperty";\n' +
            '    bamm:characteristic :Characteristic1.'
        );
      });
  });

  it('create entity rename new created property and create new default entity property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear().type('newProperty');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a bamm:Aspect;\n' +
            '    bamm:name "AspectDefault";\n' +
            '    bamm:properties (:property1);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().\n'
        );
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':Characteristic1 a bamm:Characteristic;\n' + '    bamm:name "Characteristic1";\n' + '    bamm:dataType :Entity1.'
        );
        expect(rdf).to.contain(
          ':Entity1 a bamm:Entity;\n' + '    bamm:name "Entity1";\n' + '    bamm:properties (:newProperty :property2).'
        );
        expect(rdf).to.contain(':property2 a bamm:Property;\n' + '    bamm:name "property2".');
        expect(rdf).to.contain(':newProperty a bamm:Property;\n' + '    bamm:name "newProperty".');
      });
  });

  it('rename entity after rename new created property and create new default entity property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear().type('newProperty');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('NewEntity');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.shapeExists('NewEntity'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a bamm:Aspect;\n' +
            '    bamm:name "AspectDefault";\n' +
            '    bamm:properties (:property1);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().\n'
        );
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':Characteristic1 a bamm:Characteristic;\n' + '    bamm:name "Characteristic1";\n' + '    bamm:dataType :NewEntity.'
        );
        expect(rdf).to.contain(
          ':NewEntity a bamm:Entity;\n' + '    bamm:name "NewEntity";\n' + '    bamm:properties (:newProperty :property2).'
        );
        expect(rdf).to.contain(':property2 a bamm:Property;\n' + '    bamm:name "property2".');
        expect(rdf).to.contain(':newProperty a bamm:Property;\n' + '    bamm:name "newProperty".');
      });
  });

  it('rename entity property and create new default property and then create aspect property and rename the aspect', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get('.toggle-sidebar').click({force: true}))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear().type('newProperty');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('NewEntity');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property3'))
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => {
        cy.get(FIELD_name).clear().type('NewAspect');
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.shapeExists('NewAspect'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
        );
        expect(rdf).to.contain(
          ':Characteristic1 a bamm:Characteristic;\n' + '    bamm:name "Characteristic1";\n' + '    bamm:dataType :NewEntity.'
        );
        expect(rdf).to.contain(
          ':NewAspect a bamm:Aspect;\n' +
            '    bamm:name "NewAspect";\n' +
            '    bamm:properties (:property1 :property3);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().\n'
        );
        expect(rdf).to.contain(':property3 a bamm:Property;\n' + '    bamm:name "property3".');
        expect(rdf).to.contain(
          ':NewEntity a bamm:Entity;\n' + '    bamm:name "NewEntity";\n' + '    bamm:properties (:newProperty :property2).'
        );
        expect(rdf).to.contain(':property2 a bamm:Property;\n' + '    bamm:name "property2".');
        expect(rdf).to.contain(':newProperty a bamm:Property;\n' + '    bamm:name "newProperty".');
      });
  });

  describe('property optionality', () => {
    it('should overwrite property with optional and notInPayload', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.get('.toggle-sidebar').click({force: true}))
        .then(() => cy.dbClickShape('AspectDefault'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => {
          cy.get(`input[type="checkbox"][name="property1_${FIELD_optional}"]`).click({force: true});
          cy.get(`input[type="checkbox"][name="property1_${FIELD_notInPayload}"]`).click({force: true});
          return cy.wait(500);
        })
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}))
        .then(() => cy.wait(500))
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
          );
          expect(rdf).to.contain(
            ':AspectDefault a bamm:Aspect;\n' +
              '    bamm:name "AspectDefault";\n' +
              '    bamm:properties ([\n' +
              '  bamm:property :property1;\n' +
              '  bamm:optional "true"^^xsd:boolean;\n' +
              '  bamm:notInPayload "true"^^xsd:boolean\n' +
              ']);\n' +
              '    bamm:operations ();\n' +
              '    bamm:events ().\n'
          );
        });
    });

    it('should overwrite property with payloadName', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.get('.toggle-sidebar').click({force: true}))
        .then(() => cy.dbClickShape('AspectDefault'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get(`[name="property1_${FIELD_payloadName}"]`).clear().type('payloadName'))
        .then(() => cy.wait(500))
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}))
        .then(() => cy.wait(500))
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':property1 a bamm:Property;\n' + '    bamm:name "property1";\n' + '    bamm:characteristic :Characteristic1.'
          );
          expect(rdf).to.contain(
            ':AspectDefault a bamm:Aspect;\n' +
              '    bamm:name "AspectDefault";\n' +
              '    bamm:properties ([\n' +
              '  bamm:property :property1;\n' +
              '  bamm:payloadName "payloadName"\n' +
              ']);\n' +
              '    bamm:operations ();\n' +
              '    bamm:events ().'
          );
        });
    });
  });
});
