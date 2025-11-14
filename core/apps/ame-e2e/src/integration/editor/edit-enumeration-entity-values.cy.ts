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

import {NAMESPACES_URL} from '../../support/api-mocks';
import {
  FIELD_characteristicName,
  FIELD_clearDataTypeBtn,
  FIELD_dataType,
  FIELD_dataTypeOption,
  FIELD_entityValueName,
  FIELD_name,
  FIELD_optional,
  FIELD_propertyLanguageValue,
  FIELD_propertyValueComplex,
  FIELD_propertyValueNotComplex,
  FIELD_removeEntityValue,
  SELECTOR_addEntityValue,
  SELECTOR_clearEntityValueButton,
  SELECTOR_clearLanguageButton,
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_entitySaveButton,
  SELECTOR_removeEntityValue,
  SELECTOR_resizeGutter,
  SELECTOR_saveProperties,
  SELECTOR_searchEntityValueInputField,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test enumeration entity instance', () => {
  it('should create nested entity instances', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_clearDataTypeBtn).click({force: true}))
      .then(() =>
        cy.get(FIELD_dataType).clear().type('NewEntity', {force: true}).get('.mat-mdc-option').contains('NewEntity').click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.shapeExists('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('NewEntity'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic2'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic3'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev1', {force: true}))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev2', {force: true})
          .get('.mat-mdc-option')
          .contains('ev2')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(1)
          .should('exist')
          .clear({force: true})
          .type('ev3', {force: true})
          .get('.mat-mdc-option')
          .contains('ev3')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}))
      .then(() => cy.wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.wait(200))
      .then(() => {
        cy.shapeExists('ev1');
        cy.shapeExists('ev2');
        cy.shapeExists('ev3');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm-c:values (:ev1).');
        expect(rdf).to.contain(':ev1 a :NewEntity;');
        expect(rdf).to.contain(':property2 :ev2;');
        expect(rdf).to.contain(':property3 :ev3.');
        expect(rdf).to.contain(':ev3 a :Entity2.');
        expect(rdf).to.contain(':ev2 a :Entity1.');
      });
  });

  it('should rename nested entity instances', () => {
    cy.dbClickShape('ev1')
      .then(() => {
        cy.get(FIELD_propertyValueComplex).eq(0).should('have.value', 'ev2');
        cy.get(FIELD_propertyValueComplex).eq(1).should('have.value', 'ev3');
      })
      .then(() => cy.dbClickShape('ev2'))
      .then(() => cy.get(FIELD_name).should('exist').click({force: true}).clear({force: true}).type('ev2edit', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('ev3'))
      .then(() => cy.get(FIELD_name).should('exist').click({force: true}).clear({force: true}).type('ev3edit', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => {
        cy.shapeExists('ev2edit');
        cy.shapeExists('ev3edit');
      })
      .then(() => cy.dbClickShape('ev1'))
      .then(() => {
        cy.get(FIELD_propertyValueComplex).eq(0).should('have.value', 'ev2edit');
        cy.get(FIELD_propertyValueComplex).eq(1).should('have.value', 'ev3edit');
        cyHelp.clickSaveButton();
      });
  });

  it('should add properties and set values', () => {
    cy.clickAddShapePlusIcon('Entity1')
      .clickAddShapePlusIcon('Entity2')
      .then(() => cy.dbClickShape('ev2edit'))
      .then(() => {
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').type('ev2Value', {force: true});
        cyHelp.clickSaveButton();
      })
      .then(() => cy.dbClickShape('ev3edit'))
      .then(() => {
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').type('ev3Value', {force: true});
        cyHelp.clickSaveButton();
      })
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':property4 "ev2Value".');
          expect(rdf).to.contain(':property5 "ev3Value".');
        }),
      );
  });

  it('add entity instances with one property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => {
        cy.get(FIELD_characteristicName)
          .click({force: true})
          .get('mat-option')
          .contains('Enumeration')
          .click({force: true})
          .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}))
          .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityInstance1', {force: true}))
          .then(() => cy.get('[data-cy="property2Value"]').should('exist').type('TestPropertyValue1', {force: true}))
          .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}))
          .then(() => cy.wait(200))
          .then(() => checkMatPanelTitleValues([0], ['EntityInstance1']))
          .then(() => checkMatCellValues([0], ['property2']))
          .then(() => checkMatCellValues([1], ['TestPropertyValue1']))
          .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}))
          .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityInstance2', {force: true}))
          .then(() => cy.get('[data-cy="property2Value"]').should('exist').type('TestPropertyValue2', {force: true}))
          .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}))
          .then(() => cy.wait(200))
          .then(() => checkMatPanelTitleValues([1], ['EntityInstance2']))
          .then(() => checkMatCellValues([2], ['property2']))
          .then(() => checkMatCellValues([3], ['TestPropertyValue2']))
          .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}))
          .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityInstance3', {force: true}))
          .then(() => cy.get('[data-cy="property2Value"]').should('exist').type('TestPropertyValue3', {force: true}))
          .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}))
          .then(() => cy.wait(200))
          .then(() => checkMatPanelTitleValues([2], ['EntityInstance3']))
          .then(() => checkMatCellValues([4], ['property2']))
          .then(() => checkMatCellValues([5], ['TestPropertyValue3']));
      })
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.clickShape('Characteristic1'))
      .then(() => testEntityValuesExists(['EntityInstance1', 'EntityInstance2', 'EntityInstance3']))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm-c:values (:EntityInstance1 :EntityInstance2 :EntityInstance3)');
          expect(rdf).to.contain(':Entity1 a samm:Entity;');
          expect(rdf).to.contain(':EntityInstance1 a :Entity1;');
          expect(rdf).to.contain(':property2 "TestPropertyValue1"');
          expect(rdf).to.contain(':EntityInstance2 a :Entity1;');
          expect(rdf).to.contain(':property2 "TestPropertyValue2"');
          expect(rdf).to.contain(':EntityInstance3 a :Entity1;');
          expect(rdf).to.contain(':property2 "TestPropertyValue3"');
        });
      });
  });

  it('add entity instance without property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}))
      .then(() => cy.wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityInstance', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).should('not.exist'))
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}))
      .then(() => cy.wait(200))
      .then(() => checkMatPanelTitleValues([0], ['EntityInstance']))
      .then(() => cyHelp.clickSaveButton().wait(1000))
      .then(() => testEntityValuesExists(['EntityInstance']))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm-c:values (:EntityInstance).');
        expect(rdf).to.contain(':Entity1 a samm:Entity;');
        expect(rdf).to.contain(':EntityInstance a :Entity1');
      });
  });

  it('show searchbar when complex values enumeration is selected', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_searchEntityValueInputField).should('not.exist'))
      .then(() => cy.get(SELECTOR_editorCancelButton).focus().click({force: true}))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_searchEntityValueInputField).should('exist'))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityInstance', {force: true}))
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => checkMatPanelTitleValues([0], ['EntityInstance']))
      .then(() => cyHelp.clickSaveButton());
  });

  it('import new model with entity instances', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.fixture('entity-values-enumeration')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => {
        checkMatPanelTitleValues([0], ['test1']);
        checkMatCellValues([0, 1, 2, 3], ['property2', 'test1p2', 'property3', 'test1p3']);
      })
      .then(() => {
        checkMatPanelTitleValues([1], ['test2']);
        checkMatCellValues([4, 5, 6, 7], ['property2', 'test2p2', 'property3', 'test2p3']);
      })
      .then(() => {
        checkMatPanelTitleValues([2], ['test3']);
        checkMatCellValues([8, 9, 10, 11], ['property2', 'test3p2', 'property3', 'test3p3']);
      })
      .then(() => testEntityValuesExists(['test1', 'test2', 'test3']))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm-c:values (:test1 :test2 :test3)');
          expect(rdf).to.contain(':Entity1 a samm:Entity;');
          expect(rdf).to.contain(':test1 a :Entity1;');
          expect(rdf).to.contain(':property2 "test1p2"');
          expect(rdf).to.contain(':property3 "test1p3"');
          expect(rdf).to.contain(':test2 a :Entity1;');
          expect(rdf).to.contain(':property2 "test2p2"');
          expect(rdf).to.contain(':property3 "test2p3"');
          expect(rdf).to.contain(':test3 a :Entity1;');
          expect(rdf).to.contain(':property2 "test3p2"');
          expect(rdf).to.contain(':property3 "test3p3"');
        });
      });
  });

  it('search for entity instance', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(SELECTOR_searchEntityValueInputField).should('exist').type('test2', {force: true}))
      .then(() => cy.get('mat-cell').should(cells => expect(cells).to.have.lengthOf(4)))
      .then(() => checkMatPanelTitleValues([0], ['test2']))
      .then(() => checkMatCellValues([0, 1, 2, 3], ['property2', 'test2p2', 'property3', 'test2p3']))
      .then(() => cyHelp.clickSaveButton());
  });

  it('edit all entity instances', () => {
    cy.shapeExists('test1')
      .then(() => cy.dbClickShape('test1').wait(200))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('edit1', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(0).clear({force: true}).type('property2Edit1', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(1).clear({force: true}).type('property3Edit1', {force: true}))
      .then(() => cyHelp.clickSaveButton().wait(200))

      .shapeExists('test2')
      .then(() => cy.dbClickShape('test2'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('edit2', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(0).clear({force: true}).type('property2Edit2', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(1).clear({force: true}).type('property3Edit2', {force: true}))
      .then(() => cyHelp.clickSaveButton().wait(200))

      .shapeExists('test3')
      .then(() => cy.dbClickShape('test3'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('edit3', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(0).clear({force: true}).type('property2Edit3', {force: true}))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(1).clear({force: true}).type('property3Edit3', {force: true}))
      .then(() => cyHelp.clickSaveButton().wait(200))

      .shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => {
        checkMatPanelTitleValues([0], ['edit1']);
        checkMatCellValues([0, 1, 2, 3], ['property2', 'property2Edit1', 'property3', 'property3Edit1']);
      })
      .then(() => {
        checkMatPanelTitleValues([1], ['edit2']);
        checkMatCellValues([4, 5, 6, 7], ['property2', 'property2Edit2', 'property3', 'property3Edit2']);
      })
      .then(() => {
        checkMatPanelTitleValues([2], ['edit3']);
        checkMatCellValues([8, 9, 10, 11], ['property2', 'property2Edit3', 'property3', 'property3Edit3']);
      })
      .then(() => testEntityValuesExists(['edit1', 'edit2', 'edit3']))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm-c:values (:edit1 :edit2 :edit3)');
          expect(rdf).to.contain(':Entity1 a samm:Entity;');
          expect(rdf).to.contain(':edit1 a :Entity1;');
          expect(rdf).to.contain(':property2 "property2Edit1"');
          expect(rdf).to.contain(':property3 "property3Edit1"');
          expect(rdf).to.contain(':edit2 a :Entity1;');
          expect(rdf).to.contain(':property2 "property2Edit2"');
          expect(rdf).to.contain(':property3 "property3Edit2"');
          expect(rdf).to.contain(':edit3 a :Entity1;');
          expect(rdf).to.contain(':property2 "property2Edit3"');
          expect(rdf).to.contain(':property3 "property3Edit3"');
        });
      })
      .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
  });

  it('edit one entity instances', () => {
    cy.shapeExists('edit2')
      .then(() => cy.dbClickShape('edit2'))
      .then(() => cy.get(FIELD_name).should('exist').clear({force: true}).type('editOnlyOnEntityValue', {force: true}))
      .then(() =>
        cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').clear({force: true}).type('editOnlyOnEntityValueProp2', {force: true}),
      )
      .then(() =>
        cy.get(FIELD_propertyValueNotComplex).eq(1).should('exist').clear({force: true}).type('editOnlyOnEntityValueProp3', {force: true}),
      )
      .then(() => cyHelp.clickSaveButton().wait(200))

      .dbClickShape('Characteristic1')
      .then(() => {
        checkMatPanelTitleValues([0], ['edit1']);
        checkMatCellValues([0, 1, 2, 3], ['property2', 'property2Edit1', 'property3', 'property3Edit1']);
      })
      .then(() => {
        checkMatPanelTitleValues([1], ['editOnlyOnEntityValue']);
        checkMatCellValues([4, 5, 6, 7], ['property2', 'editOnlyOnEntityValueProp2', 'property3', 'editOnlyOnEntityValueProp3']);
      })
      .then(() => {
        checkMatPanelTitleValues([2], ['edit3']);
        checkMatCellValues([8, 9, 10, 11], ['property2', 'property2Edit3', 'property3', 'property3Edit3']);
      })
      .then(() => testEntityValuesExists(['edit1', 'editOnlyOnEntityValue', 'edit3']))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm-c:values (:edit1 :editOnlyOnEntityValue :edit3)');
          expect(rdf).to.contain(':Entity1 a samm:Entity;');
          expect(rdf).to.contain(':edit1 a :Entity1;');
          expect(rdf).to.contain(':property2 "property2Edit1"');
          expect(rdf).to.contain(':property3 "property3Edit1"');
          expect(rdf).to.contain(':editOnlyOnEntityValue a :Entity1;');
          expect(rdf).to.contain(':property2 "editOnlyOnEntityValueProp2"');
          expect(rdf).to.contain(':property3 "editOnlyOnEntityValueProp3"');
          expect(rdf).to.contain(':edit3 a :Entity1;');
          expect(rdf).to.contain(':property2 "property2Edit3"');
          expect(rdf).to.contain(':property3 "property3Edit3"');
        });
      })
      .then(() => cy.get(SELECTOR_editorCancelButton).click({force: true}));
  });

  it('can not remove mandatory value', () => {
    cy.shapeExists('edit1')
      .then(() => cy.dbClickShape('edit1'))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').clear({force: true}))
      .then(() =>
        cy
          .get(SELECTOR_editorSaveButton)
          .should('be.disabled')
          .then(() => cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').clear().type('editOnlyOnEntityValueProp2'))
          .then(() => cyHelp.clickSaveButton()),
      );
  });

  it.skip('make property optional then remove its value', () => {
    cy.shapeExists('Entity1')
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => cy.get(SELECTOR_resizeGutter).click({force: true}).wait(200))
      .then(() => cy.get(`input[type="checkbox"][name="property2_${FIELD_optional}"]`).click({force: true}))
      .then(() => cy.get(SELECTOR_saveProperties).click({force: true}).wait(200))
      .then(() => cyHelp.clickSaveButton().wait(200))
      .then(() => cy.dbClickShape('edit1').wait(200))
      .then(() => cy.get(FIELD_propertyValueNotComplex).eq(0).should('exist').clear({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled'))
      .then(() => cyHelp.clickSaveButton());
  });

  it('delete all entity instance one by one', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.fixture('entity-values-enumeration')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(SELECTOR_removeEntityValue).eq(0).click({force: true}))
      .then(() => cy.get('mat-cell').should(cells => expect(cells).to.have.lengthOf(8)))
      .then(() => {
        checkMatPanelTitleValues([0], ['test2']);
        checkMatCellValues([0, 1, 2, 3], ['property2', 'test2p2', 'property3', 'test2p3']);
      })
      .then(() => {
        checkMatPanelTitleValues([1], ['test3']);
        checkMatCellValues([4, 5, 6, 7], ['property2', 'test3p2', 'property3', 'test3p3']);
      })
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.clickShape('Characteristic1'))
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm-c:values (:test2 :test3)');
          expect(rdf).to.not.contain('test1');
          testEntityValuesExists(['test2', 'test3']);
          testEntityValuesDoesNotExist(['test1']);
        });
      })
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(SELECTOR_removeEntityValue).eq(0).click({force: true}))
      .then(() => cy.get('mat-cell').should(cells => expect(cells).to.have.lengthOf(4)))
      .then(() => {
        checkMatPanelTitleValues([0], ['test3']);
        checkMatCellValues([0, 1, 2, 3], ['property2', 'test3p2', 'property3', 'test3p3']);
      })
      .then(() => cyHelp.clickSaveButton())
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('samm-c:values (:test3)');
          expect(rdf).to.not.contain('test2');
          testEntityValuesExists(['test3']);
          testEntityValuesDoesNotExist(['test2']);
        });
      });
  });

  it('should add manually new entity instance shape', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});

    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('be.visible').type('FillGapEntityValue'))
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => checkMatPanelTitleValues([0], ['FillGapEntityValue']))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cyHelp.hasAddShapeOverlay('Characteristic1'))
      .then(() => {
        cyHelp.hasAddShapeOverlay('Characteristic1');
        testEntityValuesExists(['entityInstance1']);
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':AspectDefault a samm:Aspect;\n' +
            '    samm:properties (:property1);\n' +
            '    samm:operations ();\n' +
            '    samm:events ().\n' +
            ':property1 a samm:Property;\n' +
            '    samm:characteristic :Characteristic1.\n' +
            ':Characteristic1 a samm-c:Enumeration;\n' +
            '    samm:dataType :Entity1;\n' +
            '    samm-c:values (:FillGapEntityValue :entityInstance1).\n' +
            ':Entity1 a samm:Entity;\n' +
            '    samm:properties ().\n' +
            ':FillGapEntityValue a :Entity1.\n' +
            ':entityInstance1 a :Entity1.',
        ),
      );
  });

  it('it should delete entity instance', () => {
    cy.getHTMLCell('entityInstance1')
      .click({force: true})
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => {
        cyHelp.hasAddShapeOverlay('Characteristic1');
        testEntityValuesDoesNotExist(['entityInstance1']);
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a samm:Aspect;\n' +
            '    samm:properties (:property1);\n' +
            '    samm:operations ();\n' +
            '    samm:events ().\n' +
            ':property1 a samm:Property;\n' +
            '    samm:characteristic :Characteristic1.\n' +
            ':Characteristic1 a samm-c:Enumeration;\n' +
            '    samm:dataType :Entity1;\n' +
            '    samm-c:values (:FillGapEntityValue).\n' +
            ':Entity1 a samm:Entity;\n' +
            '    samm:properties ().\n' +
            ':FillGapEntityValue a :Entity1.',
        );
      });
  });

  it('check add new entityValue overlay in place after adding multiple entityValues for one enumeration', () => {
    cy.clickShape('Characteristic1')
      .then(() => cyHelp.hasAddShapeOverlay('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cyHelp.hasAddShapeOverlay('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cyHelp.hasAddShapeOverlay('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'));
  });

  it('should create NewEntity', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});

    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'}))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_clearDataTypeBtn).click({force: true}))
      .then(() =>
        cy
          .get(FIELD_dataType)
          .clear({force: true})
          .type('NewEntity', {force: true})
          .get('.mat-mdc-option')
          .contains('NewEntity')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.shapeExists('NewEntity'));
  });

  it('should create NewEntity and new entity instances', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});

    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'}))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_clearDataTypeBtn).click({force: true}))
      .then(() =>
        cy
          .get(FIELD_dataType)
          .clear({force: true})
          .type('NewEntity', {force: true})
          .get('.mat-mdc-option')
          .contains('NewEntity')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityInstance'))
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => checkMatPanelTitleValues([0], ['EntityInstance']))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.shapeExists('NewEntity'));
  });

  it('should create enumeration with lang string values', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});

    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'}))
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.dbClickShape('Characteristic2'))
      .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
      .then(() =>
        cy.get(FIELD_dataType).clear({force: true}).type('langString', {force: true}).get(FIELD_dataTypeOption).eq(0).click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic3'))
      .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
      .then(() =>
        cy.get(FIELD_dataType).clear({force: true}).type('langString', {force: true}).get(FIELD_dataTypeOption).eq(0).click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev1', {force: true}))
      .then(() => cy.get('[data-cy="property2Value"]').should('exist').type('TestPropertyValue1', {force: true}))
      .then(() => cy.get('[data-cy="property3Value"]').should('exist').type('TestPropertyValue2', {force: true}))
      .then(() =>
        cy
          .get(FIELD_propertyLanguageValue)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('de', {force: true})
          .get('.mat-mdc-option')
          .contains('de')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_propertyLanguageValue)
          .eq(1)
          .should('exist')
          .clear({force: true})
          .type('aa', {force: true})
          .get('.mat-mdc-option')
          .contains('aa')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev2', {force: true}))
      .then(() => cy.get('[data-cy="property2Value"]').should('exist').type('TestPropertyValue3', {force: true}))
      .then(() => cy.get('[data-cy="property3Value"]').should('exist').type('TestPropertyValue4', {force: true}))
      .then(() =>
        cy
          .get(FIELD_propertyLanguageValue)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('aa', {force: true})
          .get('.mat-mdc-option')
          .contains('aa')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_propertyLanguageValue)
          .eq(1)
          .should('exist')
          .clear({force: true})
          .type('de', {force: true})
          .get('.mat-mdc-option')
          .contains('de')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('ev1'))
      .then(() => cy.get(FIELD_propertyLanguageValue).eq(0).should('exist').should('have.value', 'de'))
      .then(() => cy.get(SELECTOR_clearLanguageButton).eq(0).focus().click({force: true}))
      .then(() =>
        cy
          .get(FIELD_propertyLanguageValue)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('en', {force: true})
          .get('.mat-mdc-option')
          .contains('en')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton().wait(200))
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.contains('property2 (en)'))
      .then(() => cy.contains('property3 (de)'))
      .then(() => cy.contains('property2 (aa) '))
      .then(() => cy.contains('property3 (de) '))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':ev1 a :Entity1;');
        expect(rdf).to.contain(':property2 "TestPropertyValue1"@en');
        expect(rdf).to.contain(':property3 "TestPropertyValue2"@aa');
        expect(rdf).to.contain(':property2 "TestPropertyValue3"@aa');
        expect(rdf).to.contain(':property3 "TestPropertyValue4"@de');
      });
  });

  it('should create nested enumerations', () => {
    cy.visitDefault();
    cy.intercept(NAMESPACES_URL, {statusCode: 200, body: {}});

    cy.startModelling()
      .wait(500)
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic2'))
      .then(() => cy.clickAddShapePlusIcon('Entity2'))
      .then(() => cy.clickAddShapePlusIcon('Characteristic3'))
      .then(() => cy.clickAddShapePlusIcon('Entity3').wait(200))
      .then(() => cy.dbClickShape('Characteristic3').wait(500))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev1'))
      .then(() => cy.get('[data-cy="property4Value"]').should('exist').type('TestPropertyValue1'))
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).eq(0).should('exist').type('ev2'))
      .then(() => cy.get('[data-cy="property4Value"]').should('exist').type('TestPropertyValue2'))
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic2'))
      .then(() => {
        cy.get(FIELD_characteristicName).click({force: true});
        cy.get('mat-option').contains('Enumeration').click({force: true}).wait(200);
      })
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev3'))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev1', {force: true})
          .get('.mat-mdc-option')
          .contains('ev1')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').click({force: true}).type('ev4'))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev2', {force: true})
          .get('.mat-mdc-option')
          .contains('ev2')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').type('ev5'))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev3', {force: true})
          .get('.mat-mdc-option')
          .contains('ev3')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
      .then(() => cy.get(FIELD_entityValueName).should('exist').click({force: true}).type('ev6'))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev4', {force: true})
          .get('.mat-mdc-option')
          .contains('ev4')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
      .then(() => cyHelp.clickSaveButton())
      .then(() => {
        cy.shapesConnected('Characteristic1', 'ev6');
        cy.shapesConnected('Characteristic1', 'ev5');
        cy.shapesConnected('ev5', 'ev3');
        cy.shapesConnected('ev6', 'ev4');
        cy.shapesConnected('Characteristic2', 'ev3');
        cy.shapesConnected('Characteristic2', 'ev4');
        cy.shapesConnected('ev4', 'ev2');
        cy.shapesConnected('ev3', 'ev1');
        cy.shapesConnected('Characteristic3', 'ev1');
        cy.shapesConnected('Characteristic3', 'ev2');
      });
  });

  // Should be looked at later. Removing from form is not working properly.
  it.skip('should change and delete nested complex enumeration entity values', () => {
    cy.dbClickShape('ev3')
      .then(() => cy.get(SELECTOR_clearEntityValueButton).focus().click({force: true}))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev2', {force: true})
          .get('.mat-mdc-option')
          .contains('ev2')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton().wait(200))
      .then(() => {
        cy.shapesConnected('Characteristic1', 'ev6');
        cy.shapesConnected('Characteristic1', 'ev5');
        cy.shapesConnected('ev5', 'ev3');
        cy.shapesConnected('ev6', 'ev4');
        cy.shapesConnected('Characteristic2', 'ev3');
        cy.shapesConnected('Characteristic2', 'ev4');
        cy.shapesConnected('ev4', 'ev2');
        cy.shapesConnected('ev3', 'ev2');
        cy.shapesConnected('Characteristic3', 'ev1');
        cy.shapesConnected('Characteristic3', 'ev2');
      });

    cy.dbClickShape('ev5')
      .then(() => cy.get(SELECTOR_clearEntityValueButton).focus().click({force: true}))
      .then(() =>
        cy
          .get(FIELD_propertyValueComplex)
          .eq(0)
          .should('exist')
          .clear({force: true})
          .type('ev4', {force: true})
          .get('.mat-mdc-option')
          .contains('ev4')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton().wait(200))
      .then(() => {
        cy.shapesConnected('Characteristic1', 'ev6');
        cy.shapesConnected('Characteristic1', 'ev5');
        cy.shapesConnected('ev5', 'ev4');
        cy.shapesConnected('ev6', 'ev4');
        cy.shapesConnected('Characteristic2', 'ev3');
        cy.shapesConnected('Characteristic2', 'ev4');
        cy.shapesConnected('ev4', 'ev2');
        cy.shapesConnected('ev3', 'ev2');
        cy.shapesConnected('Characteristic3', 'ev1');
        cy.shapesConnected('Characteristic3', 'ev2');
      });

    cy.dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_removeEntityValue).eq(0).click({force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => {
        cy.shapesConnected('Characteristic1', 'ev6');
        cy.shapesConnected('ev6', 'ev4');
        cy.shapesConnected('Characteristic2', 'ev3');
        cy.shapesConnected('ev4', 'ev2');
        cy.shapesConnected('Characteristic3', 'ev1');
      });
  });

  const testEntityValuesExists = (entityValueNames: Array<string>) => {
    entityValueNames.forEach(entityValueName => {
      cy.getHTMLCell(entityValueName).should('exist');
    });
  };

  const testEntityValuesDoesNotExist = (entityValueNames: [string]) => {
    entityValueNames.forEach(entityValueName => {
      cy.get(`[data-cell-id="${entityValueName}"]`).should('not.exist');
    });
  };

  const checkMatCellValues = (positions: Array<number>, values: Array<string>) =>
    positions.forEach((position, index) => cy.get('.complex-value-items mat-cell').eq(position).scrollIntoView().contains(values[index]));

  const checkMatPanelTitleValues = (positions: Array<number>, values: Array<string>) =>
    positions.forEach((position, index) => cy.get('.complex-value-items mat-panel-title').eq(position).contains(values[index]));
});
