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
  FIELD_characteristicName,
  FIELD_chipIcon,
  FIELD_dataType,
  FIELD_deconstructionRuleInput,
  FIELD_deconstructionRuleSelect,
  FIELD_descriptionen,
  FIELD_elementsModalButton,
  FIELD_error,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_see,
  FIELD_unit,
  FIELD_values,
  META_MODEL_dataType,
  META_MODEL_description,
  META_MODEL_preferredName,
  META_MODEL_see,
  META_MODEL_values,
  SELECTOR_ecEntity,
  SELECTOR_ecProperty,
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {assertRdf} from '../../support/utils';

describe('Test editing Characteristic', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties).to.have.length(1);
        expect(aspect.properties[0].characteristic.name).to.equal('Characteristic1');
      });
  });

  it('should check that all fields are visible and the order is correct', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_name).should('be.visible'))
      .then(() => cy.get(FIELD_preferredNameen).should('be.visible'))
      .then(() => cy.get(FIELD_descriptionen).should('be.visible'))
      .then(() => cy.get(FIELD_see).should('be.visible'))
      .then(() => cy.get(FIELD_dataType).should('be.visible'))
      .then(() => cyHelp.clickSaveButton());
  });

  it('can edit description', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() =>
        cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the new created characteristic', {force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy
          .getCellLabel('Characteristic1', META_MODEL_description)
          .should('eq', `${META_MODEL_description} = New description for the new created characteristic @en`),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:description "New description for the new created characteristic"@en')),
      )
      .then(() =>
        cy
          .getAspect()
          .then(aspect =>
            expect(aspect.properties[0].characteristic.getDescription('en')).to.equal('New description for the new created characteristic'),
          ),
      );
  });

  it('can edit data type', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get('button[data-cy="clear-dataType-button"]').click({force: true}))
      .then(() =>
        cy
          .get(FIELD_dataType)
          .clear({force: true})
          .type('integer', {force: true})
          .get('.mat-mdc-option')
          .eq(1)
          .contains('integer')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getCellLabel('Characteristic1', META_MODEL_dataType).should('eq', `${META_MODEL_dataType} = integer`))
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:dataType xsd:integer')));
  });

  it('can edit see', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.addSeeElements('http://www.see1.de', 'http://www.see2.de', 'http://www.see3.de'))
      .then(() => cyHelp.clickSaveButton().wait(250))
      .then(() =>
        cy
          .getCellLabel('Characteristic1', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = http://www.see1.de,http://www.see2.de,http://www.see3.de`),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>')),
      )

      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].characteristic.see).to.have.length(3);
          expect(aspect.properties[0].characteristic.see[2]).to.equal('http://www.see3.de');
        }),
      );

    cy.dbClickShape('Characteristic1')
      .then(() => cy.removeSeeElements('http://www.see2.de'))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy.getCellLabel('Characteristic1', META_MODEL_see).should('eq', `${META_MODEL_see} = http://www.see1.de,http://www.see3.de`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see3.de>'))
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].characteristic.see).to.have.length(2);
          expect(aspect.properties[0].characteristic.see[1]).to.equal('http://www.see3.de');
        }),
      );
  });

  it('can edit see http attributes to urns', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677', 'urn:irdi:iec:0112/2///62683#ACC011#001'))
      .then(() => cyHelp.clickSaveButton())

      .then(() =>
        cy
          .getCellLabel('Characteristic1', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677,urn:irdi:iec:0112/2///62683#ACC011#001`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>, <urn:irdi:iec:0112/2///62683#ACC011#001>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.see).to.have.length(2);
        expect(aspect.properties[0].characteristic.see[1]).to.equal('urn:irdi:iec:0112/2///62683#ACC011#001');
      });

    cy.dbClickShape('Characteristic1')
      .then(() => cy.removeSeeElements().addSeeElements('urn:irdi:eclass:0173-1#02-AAO677'))
      .then(() => cyHelp.clickSaveButton())

      .then(() => cy.getCellLabel('Characteristic1', META_MODEL_see).should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:see <urn:irdi:eclass:0173-1#02-AAO677>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.see).to.have.length(1);
        expect(aspect.properties[0].characteristic.see[0]).to.equal('urn:irdi:eclass:0173-1#02-AAO677');
      });
  });

  it('can edit preferredName', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_preferredNameen).clear({force: true}).type('new-preferredName', {force: true}))
      .then(() => cyHelp.clickSaveButton())

      .then(() =>
        cy.getCellLabel('Characteristic1', META_MODEL_preferredName).should('eq', `${META_MODEL_preferredName} = new-preferredName @en`),
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('samm:preferredName "new-preferredName"@en'))
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].characteristic.getPreferredName('en')).to.equal('new-preferredName'));
  });

  it('should check incoming and outgoing edges', () => {
    cy.shapeExists('property1').then(() => cy.dbClickShape('property1'));
    cy.contains('Incoming edges (1)').should('exist');
    cy.contains('Outgoing edges (1)').should('exist');
  });

  it('can connect', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.clickShape('property1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf1 => expect(rdf1).not.contain(':property1'))
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.clickConnectShapes('property1', 'Characteristic1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf2 => expect(rdf2).to.contain('samm:characteristic :Characteristic1'));
  });

  it('can edit name', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cyHelp.renameElement('Characteristic1', 'NewCharacteristic'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewCharacteristic');
        expect(rdf).to.contain('NewCharacteristic a samm:Characteristic');
      })
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].characteristic.name).to.equal('NewCharacteristic'));
  });

  it('should validate name field', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => {
        cy.get(FIELD_name).clear().type('char22#');
        cy.get(FIELD_error).should('contain', 'Please start with an upper case character followed by letters/numerals.');
      })
      .then(() => cy.get(FIELD_name).clear())
      .then(() => cy.get(FIELD_name).clear().type('NewCharacteristic'));
  });

  it('can edit unit', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() =>
        cy.get(FIELD_unit).clear({force: true}).type('amper', {force: true}).get('mat-option').contains('ampere').click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].characteristic.unit.name).to.be.equal('ampere'));
  });

  it('can change to class Code', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Code').click({force: true}))
      .then(() => cyHelp.clickSaveButton())

      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':NewCharacteristic a samm-c:Code;\n' +
            '    samm:dataType xsd:integer;\n' +
            '    samm:description "New description for the new created characteristic"@en;\n' +
            '    samm:see <urn:irdi:eclass:0173-1#02-AAO677>;\n' +
            '    samm:preferredName "new-preferredName"@en.',
        );
      })
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].characteristic.name).to.be.equal('NewCharacteristic'));
  });

  it('can change to class Enumeration', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_values).type('1{enter}2{enter}a{enter}b{enter}3{enter}4{enter}', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getCellLabel('NewCharacteristic', META_MODEL_values).should('eq', `${META_MODEL_values} = 1, 2, a, b, 3, 4`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':NewCharacteristic a samm-c:Enumeration;\n' +
            '    samm:dataType xsd:integer;\n' +
            '    samm:description "New description for the new created characteristic"@en;\n' +
            '    samm:see <urn:irdi:eclass:0173-1#02-AAO677>;\n' +
            '    samm:preferredName "new-preferredName"@en;\n' +
            '    samm-c:values' +
            ' (1 2 "a"^^xsd:integer "b"^^xsd:integer 3 4).',
        );
      })
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].characteristic.name).to.be.equal('NewCharacteristic'));

    cy.wait(1000);
    cy.dbClickShape('NewCharacteristic')
      .then(() => cy.get(FIELD_chipIcon).each(chip => cy.wrap(chip).click({force: true})))
      .then(() => cy.get(FIELD_values).type('2{enter}b{enter}3{enter}', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getCellLabel('NewCharacteristic', META_MODEL_values).should('eq', `${META_MODEL_values} = 2, b, 3`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':NewCharacteristic a samm-c:Enumeration;\n' +
            '    samm:dataType xsd:integer;\n' +
            '    samm:description "New description for the new created characteristic"@en;\n' +
            '    samm:see <urn:irdi:eclass:0173-1#02-AAO677>;\n' +
            '    samm:preferredName "new-preferredName"@en;\n' +
            '    samm-c:values (2 "b"^^xsd:integer 3).',
        ),
      );
  });

  it('can change to class MultiLanguageText', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() =>
        cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('MultiLanguageText').click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cyHelp.getAddShapePlusIcon('MultiLanguageText').then(addShapeIcon => expect(addShapeIcon).to.be.false));
  });

  it('can delete existing', () => {
    cy.shapeExists('MultiLanguageText')
      .then(() => cy.clickShape('MultiLanguageText'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).not.contain('MultiLanguageText'));
  });

  it('add new default characteristic rename it and add new default characteristic', () => {
    cy.clickAddShapePlusIcon('property1')
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.dbClickShape('Characteristic1').wait(200))
      .then(() => cy.get(SELECTOR_editorCancelButton).focus()) // reactivate change detection
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewCharacteristic', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Characteristic1 a samm:Characteristic');
        expect(rdf).to.contain(':NewCharacteristic a samm:Characteristic');
      });
  });

  it('rename aspect and save model', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true}))
      .then(() => cyHelp.clickSaveButton());

    assertRdf([
      {
        rdfAssertions: [
          ':property1 a samm:Property;',
          'samm:characteristic :NewCharacteristic.',
          ':Characteristic1 a samm:Characteristic;',
          'samm:dataType xsd:string.',
          ':NewCharacteristic a samm:Characteristic;',
          ':property2 a samm:Property;',
          'samm:characteristic :Characteristic1.',
          ':NewAspect a samm:Aspect;',
          'samm:properties (:property1 :property2);',
          'samm:operations ();',
          'samm:events ().',
        ],
      },
    ]);
  });
});

describe('Structured Value Characteristic', () => {
  function startApplication() {
    cy.visitDefault();
    return cy.startModelling().then(() => cy.get(SELECTOR_elementBtn).click());
  }

  // Helper functions
  function addPropertiesToGroups(groups: string[], properties: string[]) {
    for (const index in groups) {
      cy.get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`)
        .clear({force: true})
        .type(properties[index], {force: true})
        .then(() => cy.wait(300))
        .then(() => cy.get('[data-cy="new-property"]').click({force: true}))
        .then(() => cy.get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`).should('have.value', properties[index]))
        .then(() => cy.get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`).should('not.be.enabled'));
    }
    return cy.then(() => cy.get('[data-cy="propertiesSaveButton"]').click());
  }

  function countAndRevealPosition(groups: string[], occurrence: string, index: number) {
    let count = 0;
    let placeNumber = 0;

    for (let i = 0; i < groups.length; i++) {
      if (groups[i] !== occurrence) {
        continue;
      }

      count++;
      placeNumber = index === i ? count - 1 : placeNumber;
    }

    return {count, placeNumber};
  }

  function shouldHaveValues(groups: string[], properties: string[]) {
    for (const index in groups) {
      const {placeNumber} = countAndRevealPosition(groups, groups[index], +index);
      cy.get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`)
        .then(() =>
          cy
            .get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`)
            .eq(placeNumber)
            .should('have.value', properties[index]),
        )
        .then(() => cy.get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`).eq(placeNumber).should('not.be.enabled'));
    }
    return cy.then(() => cyHelp.clickPropertiesCancelButton());
  }

  function checkGeneratedGroups(groups: string[]) {
    for (const group of groups) {
      cy.get(`[data-cy="regex-group-${group}"]`).should('exist');
    }
  }

  function createStructuredValueModel() {
    return cy
      .dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true}))
      .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
      .then(() => cy.contains('Email Address').click({force: true}))
      .wait(500)
      .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
      .then(() => shouldHaveValues(['([\\\\w\\\\.-]+)', '([\\\\w\\\\.-]+\\\\.\\\\w{2,4})'], ['username', 'host']))
      .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled'))
      .then(() => cyHelp.clickSaveButton())
      .wait(200)
      .then(() => cy.shapeExists('username'))
      .then(() => cy.shapeExists('host'))
      .then(() =>
        cy
          .shapeExists('UsernameCharacteristic')
          .then(() => cyHelp.hasAddShapeOverlay('UsernameCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
      )
      .then(() =>
        cy
          .shapeExists('HostCharacteristic')
          .then(() => cyHelp.hasAddShapeOverlay('HostCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
      )
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_deconstructionRuleInput).should('not.be.enabled'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:StructuredValue;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm-c:deconstructionRule "([\\\\w\\\\.-]+)@([\\\\w\\\\.-]+\\\\.\\\\w{2,4})";\n' +
            '    samm-c:elements (:username "@" :host).',
        );
      });
  }

  // Tests
  describe('Create new structured value Custom mode', () => {
    it('should extract groups', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true}),
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.get('[value="--custom-rule--"]').click({force: true}))
        .then(() =>
          cy.get(FIELD_deconstructionRuleInput).clear({force: true}).type('example-(group1)-splitter-(group2)-(group3)', {force: true}),
        )
        .then(() => cy.wait(500))
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => checkGeneratedGroups(['(group1)', '(group2)', '(group3)']));
    });

    it('should assign properties to every group', () => {
      cy.get('.groups-error')
        .should('exist')
        .then(() => addPropertiesToGroups(['(group1)', '(group2)', '(group3)'], ['group1Property', 'group2Property', 'group3Property']))
        .then(() => cy.get('groups-error').should('not.exist'));
    });

    it('should create 3 properties shapes', () => {
      cy.get(SELECTOR_editorSaveButton)
        .should('be.enabled')
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('group1Property'))
        .then(() => cy.shapeExists('group2Property'))
        .then(() => cy.shapeExists('group3Property'));
    });

    it('should keep the information', () => {
      cy.dbClickShape('Characteristic1')
        .then(() => cy.get(FIELD_deconstructionRuleSelect).should('contain', 'Custom Rule'))
        .then(() =>
          cy.get(FIELD_deconstructionRuleInput).should('be.enabled').should('have.value', 'example-(group1)-splitter-(group2)-(group3)'),
        )
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['(group1)', '(group2)', '(group3)'], ['group1Property', 'group2Property', 'group3Property']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled'))
        .then(() => cyHelp.clickSaveButton());
    });

    it('should create characteristics without add shape button', () => {
      cy.shapeExists('Characteristicgroup1Property1')
        .then(() => cyHelp.hasAddShapeOverlay('Characteristicgroup1Property1').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        .then(() =>
          cy
            .shapeExists('Characteristicgroup2Property1')
            .then(() => cyHelp.hasAddShapeOverlay('Characteristicgroup2Property1').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() =>
          cy
            .shapeExists('Characteristicgroup3Property1')
            .then(() => cyHelp.hasAddShapeOverlay('Characteristicgroup3Property1').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        );
    });

    it('should export right', () => {
      cy.getUpdatedRDF().then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a samm-c:StructuredValue;\n' +
            '    samm:dataType xsd:string;\n' +
            '    samm-c:deconstructionRule "example-(group1)-splitter-(group2)-(group3)";\n' +
            '    samm-c:elements ("example-" :group1Property "-splitter-" :group2Property "-" :group3Property).',
        );
      });
    });
  });

  describe('Create new structured value with predefined rules', () => {
    it('should create Email Address', () => {
      startApplication().then(() => createStructuredValueModel());
    });

    it('should create ISO 8601 Date', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true}),
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.contains('ISO 8601 Date').click({force: true}))
        .wait(500)
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['(\\\\d{4})', '(\\\\d{2})', '(\\\\d{2})'], ['year', 'month', 'day']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled'))
        .then(() => cyHelp.clickSaveButton())
        .wait(200)
        .then(() => cy.shapeExists('year'))
        .then(() => cy.shapeExists('month'))
        .then(() => cy.shapeExists('day'))
        .then(() =>
          cy
            .shapeExists('YearCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('YearCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() =>
          cy
            .shapeExists('MonthCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('MonthCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() =>
          cy
            .shapeExists('DayCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('DayCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_deconstructionRuleInput).should('not.be.enabled'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a samm-c:StructuredValue;\n' +
              '    samm:dataType xsd:string;\n' +
              '    samm-c:deconstructionRule "(\\\\d{4})-(\\\\d{2})-(\\\\d{2})";\n' +
              '    samm-c:elements (:year "-" :month "-" :day).',
          );
        });
    });

    it('should create Hex-encoded color', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true}),
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.contains('Hex-encoded color').click({force: true}))
        .wait(500)
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['([0-9A-Fa-f]{2})', '([0-9A-Fa-f]{2})', '([0-9A-Fa-f]{2})'], ['red', 'green', 'blue']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled'))
        .then(() => cyHelp.clickSaveButton())
        .wait(200)
        .then(() => cy.shapeExists('red'))
        .then(() => cy.shapeExists('green'))
        .then(() => cy.shapeExists('blue'))
        .then(() =>
          cy
            .shapeExists('RedCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('RedCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() =>
          cy
            .shapeExists('GreenCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('GreenCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() =>
          cy
            .shapeExists('BlueCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('BlueCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false)),
        )
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_deconstructionRuleInput).should('not.be.enabled'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a samm-c:StructuredValue;\n' +
              '    samm:dataType xsd:string;\n' +
              '    samm-c:deconstructionRule "0x([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})";\n' +
              '    samm-c:elements ("0x" :red :green :blue).',
          );
        });
    });
  });

  describe('Allowed connections', () => {
    describe('Property -> StructuredValue', () => {
      before(() => {
        startApplication();
        createStructuredValueModel();
        cy.clickShape('host');
        cy.get(SELECTOR_tbDeleteButton).click();
        cy.clickShape('username');
        cy.get(SELECTOR_tbDeleteButton).click();
      });

      it('should connect first Property -> StructuredValue', () => {
        cy.dragElement(SELECTOR_ecProperty, 350, 300);
        cy.clickConnectShapes('property2', 'HostCharacteristic');
        cy.clickConnectShapes('Characteristic1', 'property2');

        const characteristicParams = {name: 'Characteristic1'};
        const childrenParams = [{name: 'property2'}];

        childrenParams.forEach(childParams => cy.isConnected(characteristicParams, childParams).should('be.true'));

        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a samm-c:StructuredValue;\n' +
              '    samm:dataType xsd:string;\n' +
              '    samm-c:deconstructionRule "([\\\\w\\\\.-]+)@([\\\\w\\\\.-]+\\\\.\\\\w{2,4})";\n' +
              '    samm-c:elements (:property2 "@").',
          );
        });
      });

      it('should connect second Property -> StructuredValue', () => {
        cy.dragElement(SELECTOR_ecProperty, 350, 300);
        cy.clickConnectShapes('property3', 'UsernameCharacteristic');
        cy.clickConnectShapes('Characteristic1', 'property3');

        const characteristicParams = {name: 'Characteristic1'};
        const childrenParams = [{name: 'property2'}, {name: 'property3'}];

        childrenParams.forEach(childParams => cy.isConnected(characteristicParams, childParams).should('be.true'));

        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a samm-c:StructuredValue;\n' +
              '    samm:dataType xsd:string;\n' +
              '    samm-c:deconstructionRule "([\\\\w\\\\.-]+)@([\\\\w\\\\.-]+\\\\.\\\\w{2,4})";\n' +
              '    samm-c:elements (:property2 "@" :property3).',
          );
        });
      });

      it('should attach new Property', () => {
        cy.clickAddShapePlusIcon('Characteristic1');

        const characteristicParams = {name: 'Characteristic1'};
        const childrenParams = [{name: 'property2'}, {name: 'property3'}, {name: 'property4'}];

        childrenParams.forEach(childParams => cy.isConnected(characteristicParams, childParams).should('be.true'));

        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a samm-c:StructuredValue;\n' +
              '    samm:dataType xsd:string;\n' +
              '    samm-c:deconstructionRule "([\\\\w\\\\.-]+)@([\\\\w\\\\.-]+\\\\.\\\\w{2,4})(regex)";\n' +
              '    samm-c:elements (:property2 "@" :property3 :property4).',
          );
        });
      });
    });

    describe('StructuredValue -> Property', () => {
      before(() => {
        startApplication();
        createStructuredValueModel();
      });

      it('should connect first Property -> StructuredValue', () => {
        cy.dragElement(SELECTOR_ecProperty, 350, 300);
        cy.clickConnectShapes('property2', 'Characteristic1');

        const propertyParams = {name: 'property2'};
        const childrenParams = [{name: 'Characteristic1'}];

        childrenParams.forEach(childParams => cy.isConnected(propertyParams, childParams).should('be.true'));

        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':property1 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
          expect(rdf).to.contain(':property2 a samm:Property;\n' + '    samm:characteristic :Characteristic1.');
        });
      });
    });
  });

  describe('Restricted connections', () => {
    before(() => {
      startApplication();
      createStructuredValueModel();
    });

    it('should restrict StructuredValue -> Entity connection', () => {
      cy.dragElement(SELECTOR_ecEntity, 350, 300);
      cy.clickConnectShapes('Characteristic1', 'Entity1');

      const characteristicParams = {name: 'Characteristic1'};
      const entityParams = {name: 'Entity1'};
      const childrenParams = [{name: 'username'}, {name: 'host'}];

      cy.get('#toast-container').contains('Unable to connect elements').click();
      cy.isConnected(characteristicParams, entityParams).should('be.false');
      childrenParams.forEach(childParams => cy.isConnected(characteristicParams, childParams).should('be.true'));
    });

    it('should restrict recursive StructuredValue -> Property connection', () => {
      cy.clickConnectShapes('Characteristic1', 'property1');

      const characteristicParams = {name: 'Characteristic1'};
      const parentParams = {name: 'property1'};
      const childrenParams = [{name: 'username'}, {name: 'host'}];

      cy.get('#toast-container').contains('Unable to connect elements').click();
      cy.isConnected(characteristicParams, parentParams).should('be.false');
      cy.isConnected(parentParams, characteristicParams).should('be.true');
      childrenParams.forEach(childParams => {
        cy.isConnected(childParams, characteristicParams).should('be.false');
        cy.isConnected(characteristicParams, childParams).should('be.true');
      });
    });

    it('should restrict recursive Property -> StructuredValue connection', () => {
      cy.clickConnectShapes('username', 'Characteristic1');

      const characteristicParams = {name: 'Characteristic1'};
      const parentParams = {name: 'property1'};
      const childrenParams = [{name: 'username'}, {name: 'host'}];

      cy.get('#toast-container').contains('Unable to connect elements').click();
      cy.isConnected(characteristicParams, parentParams).should('be.false');
      cy.isConnected(parentParams, characteristicParams).should('be.true');
      childrenParams.forEach(childParams => {
        cy.isConnected(childParams, characteristicParams).should('be.false');
        cy.isConnected(characteristicParams, childParams).should('be.true');
      });
    });
  });
});
