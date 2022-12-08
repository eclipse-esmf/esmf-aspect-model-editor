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
  FIELD_characteristicName,
  FIELD_entityValueName,
  FIELD_name,
  FIELD_notInPayload,
  FIELD_optional,
  FIELD_payloadName,
  SELECTOR_addEntityValue,
  SELECTOR_ecProperty,
  SELECTOR_editorSaveButton,
  SELECTOR_entitySaveButton,
  SELECTOR_searchEntityValueInputField,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';

// These tests are for the special case that the name of the shape is changed and the turtle file is generated correctly.
describe('Test edit property', () => {
  it('rename first property and new property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test', {force: true});
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

  it('should remove "test" and add new named "test"', () => {
    cy.clickShape('test')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300).then(() => cy.shapeExists('property1')))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      });
  });

  it('should get error on renaming first property same as property from same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'io.openmanufacturing.digitaltwin:1.0.0': ['external-property-reference-with-children.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {'Ame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-property-reference-with-children.txt'},
      },
      {
        fixture: '/external-reference/same-namespace/with-childrens/external-property-reference.txt',
      }
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('externalPropertyWithChildren', {force: true});
        cy.get('ame-name-input-field mat-error').should(
          'contain',
          'Please select a different name as this one is already in use in the same namespace'
        );
      });
  });

  it('rename first property and rename new added property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test1', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      // Shape is not yet synced, so you cannot search for the name
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test2', {force: true});
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
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test1', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      // Shape is not yet synced, so you cannot search for the name
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test2', {force: true});
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
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test1', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test2', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test3', {force: true});
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

  it('should not allow to put 2 properties with the same name', () => {
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {});

    cy.visitDefault();
    cy.startModelling()
      // create a
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('a', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // create b
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('b', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename a to z
      .then(() => cy.dbClickShape('a'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('z', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename b to a
      .then(() => cy.dbClickShape('b'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('a', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename z to b
      .then(() => cy.dbClickShape('z'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('b', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      // rename b to a
      .then(() => cy.dbClickShape('b'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('a', {force: true});
        return cy.get(SELECTOR_editorSaveButton).should('be.disabled');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:b :a)');
        expect(rdf).to.contain(':a a bamm:Property.');
        expect(rdf).to.contain(':b a bamm:Property');
      });
  });

  it('rename aspect after rename property and create new default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('AspectDefault'))
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':property1 a bamm:Property.\n' +
            ':Characteristic1 a bamm:Characteristic;\n' +
            '    bamm:dataType xsd:string.\n' +
            ':NewAspect a bamm:Aspect;\n' +
            '    bamm:properties (:newProperty :property1);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().\n' +
            ':newProperty a bamm:Property;\n' +
            '    bamm:characteristic :Characteristic1.'
        );
      });
  });

  it('create entity rename new created property and create new default entity property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a bamm:Aspect;\n' + '    bamm:properties (:property1);\n' + '    bamm:operations ();\n' + '    bamm:events ().\n'
        );
        expect(rdf).to.contain(':property1 a bamm:Property;\n' + '    bamm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic;\n' + '    bamm:dataType :Entity1.');
        expect(rdf).to.contain(':Entity1 a bamm:Entity;\n' + '    bamm:properties (:newProperty :property2).');
        expect(rdf).to.contain(':property2 a bamm:Property.\n');
        expect(rdf).to.contain(':newProperty a bamm:Property.\n');
      });
  });

  it('rename entity after rename new created property and create new default entity property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('NewEntity', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.shapeExists('NewEntity'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a bamm:Aspect;\n' + '    bamm:properties (:property1);\n' + '    bamm:operations ();\n' + '    bamm:events ().\n'
        );
        expect(rdf).to.contain(':property1 a bamm:Property;\n' + '    bamm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic;\n' + '    bamm:dataType :NewEntity.');
        expect(rdf).to.contain(':NewEntity a bamm:Entity;\n' + '    bamm:properties (:newProperty :property2).');
        expect(rdf).to.contain(':property2 a bamm:Property.\n');
        expect(rdf).to.contain(':newProperty a bamm:Property.\n');
      });
  });

  it('rename entity property and create new default property and then create aspect property and rename the aspect', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('NewEntity', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property3'))
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true});
        return cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
      })
      .then(() => cy.shapeExists('NewAspect'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a bamm:Property;\n' + '    bamm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic;\n' + '    bamm:dataType :NewEntity.');
        expect(rdf).to.contain(
          ':NewAspect a bamm:Aspect;\n' +
            '    bamm:properties (:property1 :property3);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().\n'
        );
        expect(rdf).to.contain(':property3 a bamm:Property.\n');
        expect(rdf).to.contain(':NewEntity a bamm:Entity;\n' + '    bamm:properties (:newProperty :property2).');
        expect(rdf).to.contain(':property2 a bamm:Property.\n');
        expect(rdf).to.contain(':newProperty a bamm:Property.\n');
      });
  });

  describe('property optionality', () => {
    it('should overwrite property with optional and notInPayload should not be present', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.dbClickShape('AspectDefault'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => {
          cy.get(`input[type="checkbox"][name="property1_${FIELD_notInPayload}"]`).should('not.exist');
          cy.get(`input[type="checkbox"][name="property1_${FIELD_optional}"]`).click({force: true});
          return cy.wait(500);
        })
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}))
        .then(() => cy.wait(500))
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':property1 a bamm:Property;\n' + '    bamm:characteristic :Characteristic1.');
          expect(rdf).to.contain(
            ':AspectDefault a bamm:Aspect;\n' +
              '    bamm:properties ([\n' +
              '  bamm:property :property1;\n' +
              '  bamm:optional "true"^^xsd:boolean\n' +
              ']);\n' +
              '    bamm:operations ();\n' +
              '    bamm:events ().\n'
          );
        });
    });

    it('should overwrite property of complex enumeration with notInPayload', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
        .then(() => cy.shapeExists('Entity1'))
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
        .then(() => cy.get(SELECTOR_searchEntityValueInputField).should('exist'))
        .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
        .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityValue', {force: true}))
        .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.clickAddShapePlusIcon('Entity1'))
        .then(() => cy.dbClickShape('Entity1'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get(`input[type="checkbox"][name="property2_${FIELD_notInPayload}"]`).click({force: true}).wait(500))
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}).wait(2000))
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').should('not.exist'))
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}).wait(2000))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':Entity1 a bamm:Entity;\n' +
              '    bamm:properties ([\n' +
              '  bamm:property :property2;\n' +
              '  bamm:notInPayload "true"^^xsd:boolean\n' +
              ']).'
          );
        });
    });

    it('should overwrite property with payloadName', () => {
      cy.visitDefault();
      cy.startModelling()
        .then(() => cy.dbClickShape('AspectDefault'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get(`[name="property1_${FIELD_payloadName}"]`).clear({force: true}).type('payloadName', {force: true}))
        .then(() => cy.wait(500))
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}))
        .then(() => cy.wait(500))
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':property1 a bamm:Property;\n' + '    bamm:characteristic :Characteristic1.');
          expect(rdf).to.contain(
            ':AspectDefault a bamm:Aspect;\n' +
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
