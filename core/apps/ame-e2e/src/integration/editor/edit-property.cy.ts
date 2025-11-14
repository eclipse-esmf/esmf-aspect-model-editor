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
import {NAMESPACES_URL} from '../../support/api-mocks';

import {
  FIELD_characteristicName,
  FIELD_descriptionen,
  FIELD_entityValueName,
  FIELD_error,
  FIELD_name,
  FIELD_notInPayload,
  FIELD_optional,
  FIELD_payloadName,
  FIELD_preferredNameen,
  FIELD_see,
  META_MODEL_description,
  META_MODEL_preferredName,
  META_MODEL_see,
  SELECTOR_addEntityValue,
  SELECTOR_ecProperty,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_entitySaveButton,
  SELECTOR_exampleProperty,
  SELECTOR_searchEntityValueInputField,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

// These tests are for the special case that the name of the shape is changed and the turtle file is generated correctly.
describe('Test edit property', () => {
  it('should rename first property and new property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:test :property1)');
        expect(rdf).to.contain(':test a samm:Property;');
        expect(rdf).to.contain(':property1 a samm:Property');
      });
  });

  it('should remove "test" and add new named "test"', () => {
    cy.clickShape('test')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300).then(() => cy.shapeExists('property1')))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test', {force: true});
        cyHelp.forceChangeDetection().then(() => cyHelp.clickSaveButton());
      });
  });

  it('should get error on renaming first property same as property from same namespace', () => {
    const fileNameOne = 'external-property-reference.ttl';

    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', NAMESPACES_URL, {
      'org.eclipse.examples.aspect:1.0.0': [fileNameOne],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9090/ame/api/models',
        headers: {namespace: 'org.eclipse.examples.aspect:1.0.0', 'file-name': fileNameOne},
      },
      {
        fixture: `/external-reference/same-namespace/with-childrens/${fileNameOne}`,
      },
    );

    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('externalPropertyWithChildren ', {force: true}).wait(1000))
      .then(() =>
        cy.get('ame-name-input-field mat-error').contains('Please start with a lower case character followed by letters/numerals.'),
      );
  });

  it('should check that all fields are visible and the order is correct', () => {
    cy.shapeExists('property1')
      .then(() => cy.dbClickShape('property1'))
      .then(() => cy.get(FIELD_name).clear().should('be.visible').type('property1'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for Property'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('This is a property'))
      .then(() => cy.get(FIELD_see).should('be.visible'))
      .then(() => cy.get(SELECTOR_exampleProperty).should('be.visible').clear().type('example'))
      .then(() => cyHelp.clickSaveButton());
  });

  it('should check incoming and outgoing edges', () => {
    cy.shapeExists('property1').then(() => cy.dbClickShape('property1'));
    cy.contains('Incoming edges (1)').should('exist');
    cy.contains('Outgoing edges (1)').should('exist');
  });

  it('should validate edit property name field', () => {
    cy.shapeExists('property1')
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear().type('Property2#');
        cy.get(FIELD_error).should('contain', 'Please start with a lower case character followed by letters/numerals.');
      })
      .then(() => cy.get(FIELD_name).clear())
      .then(() => cy.get(FIELD_name).clear().type('property1'));
  });

  it('should edit preferredName', () => {
    cy.shapeExists('property1')
      .then(() => cy.dbClickShape('property1'))
      .then(() => cy.get(FIELD_preferredNameen).clear().type('New Preffered Name for property'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('property1', META_MODEL_preferredName)
          .should('eq', `${META_MODEL_preferredName} = New Preffered Name for property @en`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:preferredName "New Preffered Name for property"@en'));
  });

  it('should edit property description field', () => {
    cy.shapeExists('property1')
      .then(() => cy.dbClickShape('property1'))
      .then(() => cy.get(FIELD_descriptionen).clear().type('New description for the property'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('property1', META_MODEL_description)
          .should('eq', `${META_MODEL_description} = New description for the property @en`),
      )
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:description "New description for the property"@en')));
  });

  it('should edit see property field', () => {
    cy.shapeExists('property1')
      .then(() => cy.dbClickShape('property1'))
      .then(() => cy.addSeeElements('http://www.seeA.de', 'http://www.seeB.de', 'http://www.seeC.de'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('property1', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = http://www.seeA.de,http://www.seeB.de,http://www.seeC.de`),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:see <http://www.seeA.de>, <http://www.seeB.de>, <http://www.seeC.de>')),
      )
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].see).to.have.length(3);
          expect(aspect.properties[0].see[2]).to.equal('http://www.seeC.de');
        }),
      );
    cy.dbClickShape('property1')
      .then(() => cy.removeSeeElements('http://www.seeB.de'))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getCellLabel('property1', META_MODEL_see).should('eq', `${META_MODEL_see} = http://www.seeA.de,http://www.seeC.de`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <http://www.seeA.de>, <http://www.seeC.de>'))
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].see).to.have.length(2);
          expect(aspect.properties[0].see[1]).to.equal('http://www.seeC.de');
        }),
      );
  });

  it('should edit see http attributes to urns', () => {
    cy.shapeExists('property1')
      .then(() => cy.dbClickShape('property1'))
      .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677', 'urn:irdi:iec:0112/2///62683#ACC011#001'))
      .then(() => cyHelp.clickSaveButton())

      .then(() =>
        cy
          .getCellLabel('property1', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677,urn:irdi:iec:0112/2///62683#ACC011#001`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>, <urn:irdi:iec:0112/2///62683#ACC011#001>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].see).to.have.length(2);
        expect(aspect.properties[0].see[1]).to.equal('urn:irdi:iec:0112/2///62683#ACC011#001');
      });

    cy.dbClickShape('property1')
      .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677'))
      .then(() => cyHelp.clickSaveButton())

      .then(() => cy.getCellLabel('property1', META_MODEL_see).should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].see).to.have.length(1);
        expect(aspect.properties[0].see[0]).to.equal('urn:irdi:eclass:0173-1#02-AAO677');
      });
  });

  it('should rename first property and rename new added property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test1', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      // Shape is not yet synced, so you cannot search for the name
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test2', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:test1 :test2)');
        expect(rdf).to.contain(':test1 a samm:Property;');
        expect(rdf).to.contain(':test2 a samm:Property');
      });
  });

  it('should rename first property and rename second added second property and add new default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test1', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      // Shape is not yet synced, so you cannot search for the name
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test2', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:test1 :test2 :property1)');
        expect(rdf).to.contain(':test1 a samm:Property;');
        expect(rdf).to.contain(':test2 a samm:Property');
        expect(rdf).to.contain(':property1 a samm:Property');
      });
  });

  it('should rename property and rename second added property and rename third added default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test1', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test2', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('test3', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:test1 :test2 :test3)');
        expect(rdf).to.contain(':test1 a samm:Property;');
        expect(rdf).to.contain(':test2 a samm:Property');
        expect(rdf).to.contain(':test3 a samm:Property');
      });
  });

  it('should not allow to put 2 properties with the same name', () => {
    cy.intercept('GET', NAMESPACES_URL, {statusCode: 200, body: {}});

    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      // create a
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('a', {force: true});
        return cyHelp.clickSaveButton();
      })
      // create b
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('b', {force: true});
        return cyHelp.clickSaveButton();
      })
      // rename a to z
      .then(() => cy.dbClickShape('a'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('z', {force: true});
        return cyHelp.clickSaveButton();
      })
      // rename b to a
      .then(() => cy.dbClickShape('b'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('a', {force: true});
        return cyHelp.clickSaveButton();
      })
      // rename z to b
      .then(() => cy.dbClickShape('z'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('b', {force: true});
        return cyHelp.clickSaveButton();
      })
      // rename b to a
      .then(() => cy.dbClickShape('b'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('a', {force: true});
        return cy.get(SELECTOR_editorSaveButton).should('be.disabled');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:properties (:b :a)');
        expect(rdf).to.contain(':a a samm:Property');
        expect(rdf).to.contain(':b a samm:Property');
      });
  });

  it('should rename aspect after rename property and create new default property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('property1'))
      .then(() => cy.dbClickShape('property1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('AspectDefault'))
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic;\n' + '    samm:dataType xsd:string.\n');
        expect(rdf).to.contain(
          ':NewAspect a samm:Aspect;\n' +
            '    samm:properties (:newProperty :property1);\n' +
            '    samm:operations ();\n' +
            '    samm:events ().\n',
        );
        expect(rdf).to.contain(':newProperty a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
      });
  });

  it('should create entity rename new created property and create new default entity property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a samm:Aspect;\n' + '    samm:properties (:property1);\n' + '    samm:operations ();\n' + '    samm:events ().\n',
        );
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic;\n' + '    samm:dataType :Entity1.');
        expect(rdf).to.contain(':Entity1 a samm:Entity;\n' + '    samm:properties (:newProperty :property2).');
        expect(rdf).to.contain(':property2 a samm:Property');
        expect(rdf).to.contain(':newProperty a samm:Property');
      });
  });

  it('should rename entity after rename new created property and create new default entity property', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('NewEntity', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.shapeExists('NewEntity'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':AspectDefault a samm:Aspect;\n' + '    samm:properties (:property1);\n' + '    samm:operations ();\n' + '    samm:events ().\n',
        );
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic;\n' + '    samm:dataType :NewEntity.');
        expect(rdf).to.contain(':NewEntity a samm:Entity;\n' + '    samm:properties (:newProperty :property2).');
        expect(rdf).to.contain(':property2 a samm:Property');
        expect(rdf).to.contain(':newProperty a samm:Property');
      });
  });

  it('should rename entity property and create new default property and then create aspect property and rename the aspect', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => cy.shapeExists('Entity1'))
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('property2'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('newProperty', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('Entity1'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('NewEntity', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property3'))
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => {
        cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true});
        return cyHelp.clickSaveButton();
      })
      .then(() => cy.shapeExists('NewAspect'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic;\n' + '    samm:dataType :NewEntity.');
        expect(rdf).to.contain(
          ':NewAspect a samm:Aspect;\n' +
            '    samm:properties (:property1 :property3);\n' +
            '    samm:operations ();\n' +
            '    samm:events ().\n',
        );
        expect(rdf).to.contain(':property3 a samm:Property');
        expect(rdf).to.contain(':NewEntity a samm:Entity;\n' + '    samm:properties (:newProperty :property2).');
        expect(rdf).to.contain(':property2 a samm:Property');
        expect(rdf).to.contain(':newProperty a samm:Property');
      });
  });

  describe('property optionality', () => {
    it('should overwrite property with optional and notInPayload should not be present', () => {
      cy.visitDefault();
      cy.startModelling()
        .wait(500)
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dbClickShape('AspectDefault'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => {
          cy.get(`input[type="checkbox"][name="property1_${FIELD_notInPayload}"]`).should('not.exist');
          cy.get(`input[type="checkbox"][name="property1_${FIELD_optional}"]`).click({force: true});
          return cy.wait(500);
        })
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}))
        .then(() => cy.wait(500))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':property1 a samm:Property;');
          expect(rdf).to.contain('samm:characteristic :Characteristic1.');
          expect(rdf).to.contain('samm:properties ([\n  samm:property :property1;\n');
          expect(rdf).to.contain('samm:optional true\n])');
          expect(rdf).not.to.contain('notInPayload');
        });
    });

    it('should overwrite property of complex enumeration with notInPayload', () => {
      cy.visitDefault();
      cy.startModelling()
        .wait(500)
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
        .then(() => cy.shapeExists('Entity1'))
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
        .then(() => cy.get(SELECTOR_searchEntityValueInputField).should('exist'))
        .then(() => cy.get(SELECTOR_addEntityValue).click({force: true}).wait(200))
        .then(() => cy.get(FIELD_entityValueName).should('exist').type('EntityValue', {force: true}))
        .then(() => cy.get(SELECTOR_entitySaveButton).click({force: true}).wait(200))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.clickAddShapePlusIcon('Entity1'))
        .then(() => cy.dbClickShape('Entity1'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => {
          cy.get(`input[type="checkbox"][name="property2_${FIELD_notInPayload}"]`).click({force: true});
          return cy.wait(500);
        })
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}).should('not.exist'))
        .then(() => cy.wait(500))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':Entity1 a samm:Entity;\n');
          expect(rdf).to.contain('samm:properties ([\n  samm:property :property2;\n');
          expect(rdf).to.contain('samm:notInPayload true\n])');
          expect(rdf).not.to.contain('optional');
        });
    });

    it('should overwrite property with payloadName', () => {
      cy.visitDefault();
      cy.startModelling()
        .wait(500)
        .then(() => cy.get(SELECTOR_elementBtn).click())
        .then(() => cy.dbClickShape('AspectDefault'))
        .then(() => cy.get('[data-cy="properties-modal-button"]').click({force: true}))
        .then(() => cy.get(`[name="property1_${FIELD_payloadName}"]`).clear({force: true}).type('payloadName', {force: true}))
        .then(() => cy.wait(500))
        .then(() => cy.get('[data-cy="propertiesSaveButton"]').click({force: true}))
        .then(() => cy.wait(500))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
          expect(rdf).to.contain(
            ':AspectDefault a samm:Aspect;\n' +
              '    samm:properties ([\n' +
              '  samm:property :property1;\n' +
              '  samm:payloadName "payloadName"\n' +
              ']);\n' +
              '    samm:operations ();\n' +
              '    samm:events ().',
          );
        });
    });
  });
});
