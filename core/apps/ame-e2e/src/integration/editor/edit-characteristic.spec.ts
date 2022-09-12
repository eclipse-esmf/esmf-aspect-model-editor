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
  FIELD_chipIcon,
  FIELD_dataType,
  FIELD_deconstructionRuleInput,
  FIELD_deconstructionRuleSelect,
  FIELD_descriptionen,
  FIELD_elementsModalButton,
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
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {Aspect} from '@ame/meta-model';

describe('Test editing Characteristic', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties).to.have.length(1);
        expect(aspect.properties[0].property.characteristic.name).to.equal('Characteristic1');
      });
  });

  it('can edit description', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() =>
        cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the new created characteristic', {force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy
          .getCellLabel('Characteristic1', META_MODEL_description)
          .should('eq', `${META_MODEL_description} = New description for the new created characteristic @en`)
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('bamm:description "New description for the new created characteristic"@en'))
      )
      .then(() =>
        cy
          .getAspect()
          .then(aspect =>
            expect(aspect.properties[0].property.characteristic.getDescription('en')).to.equal(
              'New description for the new created characteristic'
            )
          )
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
          .get('.mat-option-text')
          .eq(1)
          .contains('integer')
          .click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getCellLabel('Characteristic1', META_MODEL_dataType).should('eq', `${META_MODEL_dataType} = integer`))
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('bamm:dataType xsd:integer')));
  });

  it('can edit see', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_see).clear({force: true}).type('http://www.see1.de,http://www.see2.de,http://www.see3.de', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy
          .getCellLabel('Characteristic1', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = http://www.see1.de,http://www.see2.de,http://www.see3.de`)
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('bamm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>'))
      )

      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.getSeeReferences()).to.have.length(3);
          expect(aspect.properties[0].property.characteristic.getSeeReferences()[2]).to.equal('http://www.see3.de');
        })
      );

    cy.dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_see).clear({force: true}).type('http://www.see1.de,http://www.see3.de', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getCellLabel('Characteristic1', META_MODEL_see).should('eq', `${META_MODEL_see} = http://www.see1.de,http://www.see3.de`)
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('bamm:see <http://www.see1.de>, <http://www.see3.de>'))
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.properties[0].property.characteristic.getSeeReferences()).to.have.length(2);
          expect(aspect.properties[0].property.characteristic.getSeeReferences()[1]).to.equal('http://www.see3.de');
        })
      );
  });

  it('can edit see http attributes to urns', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() =>
        cy
          .get(FIELD_see)
          .clear({force: true})
          .type('urn:irdi:eclass:0173-1#02-AAO677,urn:irdi:iec:0112/2///62683#ACC011#001', {force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))

      .then(() =>
        cy
          .getCellLabel('Characteristic1', META_MODEL_see)
          .should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677,urn:irdi:iec:0112/2///62683#ACC011#001`)
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('bamm:see <urn:irdi:eclass:0173-1#02-AAO677>, <urn:irdi:iec:0112/2///62683#ACC011#001>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].property.characteristic.getSeeReferences()).to.have.length(2);
        expect(aspect.properties[0].property.characteristic.getSeeReferences()[1]).to.equal('urn:irdi:iec:0112/2///62683#ACC011#001');
      });

    cy.dbClickShape('Characteristic1')
      .then(() => cy.get(FIELD_see).clear({force: true}).type('urn:irdi:eclass:0173-1#02-AAO677', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))

      .then(() => cy.getCellLabel('Characteristic1', META_MODEL_see).should('eq', `${META_MODEL_see} = urn:irdi:eclass:0173-1#02-AAO677`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('bamm:see <urn:irdi:eclass:0173-1#02-AAO677>'))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].property.characteristic.getSeeReferences()).to.have.length(1);
        expect(aspect.properties[0].property.characteristic.getSeeReferences()[0]).to.equal('urn:irdi:eclass:0173-1#02-AAO677');
      });
  });

  it('can edit preferredName', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_preferredNameen).clear({force: true}).type('new-preferredName', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))

      .then(() =>
        cy.getCellLabel('Characteristic1', META_MODEL_preferredName).should('eq', `${META_MODEL_preferredName} = new-preferredName @en`)
      )
      .then(() => cy.getUpdatedRDF())
      .then(rdf => expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en'))
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].property.characteristic.getPreferredName('en')).to.equal('new-preferredName'));
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
      .then(rdf2 => expect(rdf2).to.contain('bamm:characteristic :Characteristic1'));
  });

  it('can edit name', () => {
    cy.shapeExists('Characteristic1')
      .then(() => cyHelp.renameElement('Characteristic1', 'NewCharacteristic'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':NewCharacteristic');
        expect(rdf).to.contain('NewCharacteristic a bamm:Characteristic');
      })
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].property.characteristic.name).to.equal('NewCharacteristic'));
  });

  it('can edit unit', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Measurement').click({force: true}))
      .then(() =>
        cy.get(FIELD_unit).clear({force: true}).type('amper', {force: true}).get('mat-option').contains('ampere').click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].property.characteristic.unit.name).to.be.equal('ampere'));
  });

  it('can change to class Code', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Code').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))

      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(
          ':NewCharacteristic a bamm-c:Code;\n' +
            '    bamm:dataType xsd:integer;\n' +
            '    bamm:description "New description for the new created characteristic"@en;\n' +
            '    bamm:see <urn:irdi:eclass:0173-1#02-AAO677>;\n' +
            '    bamm:preferredName "new-preferredName"@en.'
        );
      })
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].property.characteristic.name).to.be.equal('NewCharacteristic'));
  });

  it('can change to class Enumeration', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Enumeration').click({force: true}))
      .then(() => cy.get(FIELD_values).type('1{enter}2{enter}a{enter}b{enter}3{enter}4{enter}', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getCellLabel('NewCharacteristic', META_MODEL_values).should('eq', `${META_MODEL_values} = 1, 2, a, b, 3, 4`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':NewCharacteristic a bamm-c:Enumeration;\n' +
            '    bamm:dataType xsd:integer;\n' +
            '    bamm:description "New description for the new created characteristic"@en;\n' +
            '    bamm:see <urn:irdi:eclass:0173-1#02-AAO677>;\n' +
            '    bamm:preferredName "new-preferredName"@en;\n' +
            '    bamm-c:values' +
            ' ("1"^^xsd:integer "2"^^xsd:integer "a"^^xsd:integer "b"^^xsd:integer "3"^^xsd:integer "4"^^xsd:integer).'
        )
      )
      .then(() => cy.getAspect())
      .then(aspect => expect(aspect.properties[0].property.characteristic.name).to.be.equal('NewCharacteristic'));

    cy.wait(1000);
    cy.dbClickShape('NewCharacteristic')
      .then(() => cy.get(FIELD_chipIcon).each(chip => cy.wrap(chip).click({force: true})))
      .then(() => cy.get(FIELD_values).type('2{enter}b{enter}3{enter}', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getCellLabel('NewCharacteristic', META_MODEL_values).should('eq', `${META_MODEL_values} = 2, b, 3`))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':NewCharacteristic a bamm-c:Enumeration;\n' +
            '    bamm:dataType xsd:integer;\n' +
            '    bamm:description "New description for the new created characteristic"@en;\n' +
            '    bamm:see <urn:irdi:eclass:0173-1#02-AAO677>;\n' +
            '    bamm:preferredName "new-preferredName"@en;\n' +
            '    bamm-c:values ("2"^^xsd:integer "b"^^xsd:integer "3"^^xsd:integer).'
        )
      );
  });

  it('can change to class MultiLanguageText', () => {
    cy.shapeExists('NewCharacteristic')
      .then(() => cy.dbClickShape('NewCharacteristic'))
      .then(() =>
        cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('MultiLanguageText').click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
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
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.clickAddShapePlusIcon('AspectDefault'))
      .then(() => cy.shapeExists('property2'))
      .then(() => cy.clickAddShapePlusIcon('property2'))
      .then(() => cy.shapeExists('Characteristic1'))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain(':Characteristic1 a bamm:Characteristic.\n');
        expect(rdf).to.contain(':NewCharacteristic a bamm:Characteristic.\n');
      });
  });

  it('rename aspect and save model', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cy.getUpdatedRDF())
      .then(rdf =>
        expect(rdf).to.contain(
          ':property1 a bamm:Property;\n' +
            '    bamm:characteristic :NewCharacteristic.\n' +
            ':Characteristic1 a bamm:Characteristic.\n' +
            ':NewCharacteristic a bamm:Characteristic.\n' +
            ':property2 a bamm:Property;\n' +
            '    bamm:characteristic :Characteristic1.\n' +
            ':NewAspect a bamm:Aspect;\n' +
            '    bamm:properties (:property1 :property2);\n' +
            '    bamm:operations ();\n' +
            '    bamm:events ().'
        )
      );
  });
});

describe('Structured Value Characteristic', () => {
  function startApplication() {
    cy.visitDefault();
    return cy.startModelling();
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
            .should('have.value', properties[index])
        )
        .then(() => cy.get(`[data-cy="property-${groups[index]}"] [data-cy="property-element"]`).eq(placeNumber).should('not.be.enabled'));
    }
    return cy.then(() => cy.get('[data-cy="propertiesSaveButton"]').click());
  }

  function checkGeneratedGroups(groups: string[]) {
    for (const group of groups) {
      cy.get(`[data-cy="regex-group-${group}"]`).should('exist');
    }
  }

  // Tests
  describe('Create new structured value Custom mode', () => {
    it('should extract groups', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true})
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.get('[value="--custom-rule--"]').click({force: true}))
        .then(() =>
          cy.get(FIELD_deconstructionRuleInput).clear({force: true}).type('example-(group1)-splitter-(group2)-(group3)', {force: true})
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
        .click({force: true})
        .then(() => cy.shapeExists('group1Property'))
        .then(() => cy.shapeExists('group2Property'))
        .then(() => cy.shapeExists('group3Property'));
    });

    it('should keep the information', () => {
      cy.dbClickShape('Characteristic1')
        .then(() => cy.get(FIELD_deconstructionRuleSelect).should('contain', 'Custom Rule'))
        .then(() =>
          cy.get(FIELD_deconstructionRuleInput).should('be.enabled').should('have.value', 'example-(group1)-splitter-(group2)-(group3)')
        )
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['(group1)', '(group2)', '(group3)'], ['group1Property', 'group2Property', 'group3Property']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled').click({force: true}));
    });

    it('should create characteristics without add shape button', () => {
      cy.clickAddShapePlusIcon('group1Property')
        .then(() => cy.clickAddShapePlusIcon('group2Property'))
        .then(() => cy.clickAddShapePlusIcon('group3Property'))
        .then(() =>
          cy
            .shapeExists('Characteristic2')
            .then(() => cyHelp.hasAddShapeOverlay('Characteristic2').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('Characteristic3')
            .then(() => cyHelp.hasAddShapeOverlay('Characteristic3').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('Characteristic4')
            .then(() => cyHelp.hasAddShapeOverlay('Characteristic4').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        );
    });

    it('should export right', () => {
      cy.getUpdatedRDF().then(rdf => {
        expect(rdf).to.contain(
          ':Characteristic1 a bamm-c:StructuredValue;\n' +
            '    bamm:dataType xsd:string;\n' +
            '    bamm-c:deconstructionRule "example-(group1)-splitter-(group2)-(group3)";\n' +
            '    bamm-c:elements ("example-" :group1Property "-splitter-" :group2Property "-" :group3Property).'
        );
      });
    });
  });

  describe('Create new structured value with predefined rules', () => {
    it('should create Email Address', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true})
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.contains('Email Address').click({force: true}))
        .wait(500)
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['([\\\\w\\\\.-]+)', '([\\\\w\\\\.-]+\\\\.\\\\w{2,4})'], ['username', 'host']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled').click({force: true}))
        .wait(200)
        .then(() => cy.shapeExists('username'))
        .then(() => cy.shapeExists('host'))
        .then(() =>
          cy
            .shapeExists('UsernameCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('UsernameCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('HostCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('HostCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_deconstructionRuleInput).should('not.be.enabled'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a bamm-c:StructuredValue;\n' +
              '    bamm:dataType xsd:string;\n' +
              '    bamm-c:deconstructionRule "([\\\\w\\\\.-]+)@([\\\\w\\\\.-]+\\\\.\\\\w{2,4})";\n' +
              '    bamm-c:elements (:username "@" :host).'
          );
        });
    });

    it('should create ISO 8601 Date', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true})
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.contains('ISO 8601 Date').click({force: true}))
        .wait(500)
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['(\\\\d{4})', '(\\\\d{2})', '(\\\\d{2})'], ['year', 'month', 'day']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled').click({force: true}))
        .wait(200)
        .then(() => cy.shapeExists('year'))
        .then(() => cy.shapeExists('month'))
        .then(() => cy.shapeExists('day'))
        .then(() =>
          cy
            .shapeExists('YearCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('YearCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('MonthCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('MonthCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('DayCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('DayCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_deconstructionRuleInput).should('not.be.enabled'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a bamm-c:StructuredValue;\n' +
              '    bamm:dataType xsd:string;\n' +
              '    bamm-c:deconstructionRule "(\\\\d{4})-(\\\\d{2})-(\\\\d{2})";\n' +
              '    bamm-c:elements (:year "-" :month "-" :day).'
          );
        });
    });

    it('should create Hex-encoded color', () => {
      startApplication()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('StructuredValue').click({force: true})
        )
        .then(() => cy.get(FIELD_deconstructionRuleSelect).click({force: true}))
        .then(() => cy.contains('Hex-encoded color').click({force: true}))
        .wait(500)
        .then(() => cy.get(FIELD_elementsModalButton).click({force: true}))
        .then(() => shouldHaveValues(['([0-9A-Fa-f]{2})', '([0-9A-Fa-f]{2})', '([0-9A-Fa-f]{2})'], ['red', 'green', 'blue']))
        .then(() => cy.get(SELECTOR_editorSaveButton).should('be.enabled').click({force: true}))
        .wait(200)
        .then(() => cy.shapeExists('red'))
        .then(() => cy.shapeExists('green'))
        .then(() => cy.shapeExists('blue'))
        .then(() =>
          cy
            .shapeExists('RedCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('RedCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('GreenCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('GreenCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() =>
          cy
            .shapeExists('BlueCharacteristic')
            .then(() => cyHelp.hasAddShapeOverlay('BlueCharacteristic').then(addShapeIcon => expect(addShapeIcon).to.be.false))
        )
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(FIELD_deconstructionRuleInput).should('not.be.enabled'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain(
            ':Characteristic1 a bamm-c:StructuredValue;\n' +
              '    bamm:dataType xsd:string;\n' +
              '    bamm-c:deconstructionRule "0x([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})";\n' +
              '    bamm-c:elements ("0x" :red :green :blue).'
          );
        });
    });
  });
});
