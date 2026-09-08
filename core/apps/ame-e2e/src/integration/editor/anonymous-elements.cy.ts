/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

/// <reference types="cypress" />

import {
  ACTION_dialogButton,
  FIELD_characteristicName,
  FIELD_constraintName,
  FIELD_deconstructionRuleInput,
  FIELD_languageCode,
  FIELD_left,
  FIELD_localeCode,
  FIELD_name,
  FIELD_right,
  FIELD_unit,
  FIELD_value,
  FIELD_values,
  OK_dialogButton,
  SELECTOR_anonymousToggle,
  SELECTOR_ecValue,
  SELECTOR_elementBtn,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test Anonymous Elements', () => {
  before(() => {
    cy.visitDefault();
  });

  describe('Anonymous Characteristics and various classes', () => {
    it('can create anonymous default Characteristic', () => {
      cy.startModelling()
        .then(() => cy.shapeExists('Characteristic1'))
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cy.get(FIELD_name).should('have.value', '[Characteristic]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Characteristic]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm:Characteristic');
          expect(rdf).to.contain('samm:dataType xsd:string');
          cy.getAspect().then(aspect => {
            expect(aspect.properties[0].characteristic.isAnonymous()).to.be.true;
            expect(aspect.properties[0].characteristic.name).to.equal('[Characteristic]');
          });
        });
    });

    it('can switch anonymous Characteristic to List, Set, and SortedSet', () => {
      cy.dbClickShape('[Characteristic]')
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('List').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[List]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[List]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:List');
          expect(rdf).to.contain('samm:dataType xsd:string');
        })
        .then(() => cy.dbClickShape('[List]'))
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Set').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[Set]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Set]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Set');
          expect(rdf).to.contain('samm:dataType xsd:string');
        })
        .then(() => cy.dbClickShape('[Set]'))
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('SortedSet').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[SortedSet]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[SortedSet]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:SortedSet');
          expect(rdf).to.contain('samm:dataType xsd:string');
        });
    });

    it('can switch anonymous Characteristic to Measurement, Quantifiable, and Duration', () => {
      cy.dbClickShape('[SortedSet]')
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Measurement').click({force: true});
          cy.get(FIELD_unit).clear({force: true});
          cy.get(FIELD_unit).type('percent', {force: true});
          cy.get('mat-option').contains('percent').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[Measurement]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Measurement]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Measurement');
          expect(rdf).to.contain('samm-c:unit');
          expect(rdf).to.contain('percent');
          expect(rdf).to.contain('samm:dataType xsd:string');
        })
        .then(() => cy.dbClickShape('[Measurement]'))
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Quantifiable').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[Quantifiable]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Quantifiable]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Quantifiable');
          expect(rdf).to.contain('samm-c:unit');
          expect(rdf).to.contain('percent');
          expect(rdf).to.contain('samm:dataType xsd:string');
        })
        .then(() => cy.dbClickShape('[Quantifiable]'))
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Duration').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[Duration]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Duration]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Duration');
          expect(rdf).to.contain('samm-c:unit');
          expect(rdf).to.contain('percent');
          expect(rdf).to.contain('samm:dataType xsd:string');
        });
    });

    it('can switch anonymous Characteristic to State', () => {
      cy.dbClickShape('[Duration]')
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('State').click({force: true});
          cy.get(FIELD_values).type('open', {force: true});
          cy.get('mat-option').eq(0).click({force: true});
          cy.get(FIELD_values).type('closed', {force: true});
          cy.get('mat-option').eq(0).click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[State]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[State]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:State');
          expect(rdf).to.contain('samm:dataType xsd:string');
          expect(rdf).to.contain('samm-c:values ("open" "closed")');
        });
    });

    it('can switch anonymous Characteristic to Enumeration', () => {
      cy.dbClickShape('[State]')
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Enumeration').click({force: true});
          cy.get(FIELD_values).type('OptionA', {force: true});
          cy.get('mat-option').eq(0).click({force: true});
          cy.get(FIELD_values).type('OptionB', {force: true});
          cy.get('mat-option').eq(0).click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[Enumeration]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Enumeration]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Enumeration');
          expect(rdf).to.contain('samm:dataType xsd:string');
          expect(rdf).to.contain('"OptionA"');
          expect(rdf).to.contain('"OptionB"');
        });
    });

    it('can switch anonymous Characteristic to StructuredValue', () => {
      cy.dbClickShape('[Enumeration]')
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('StructuredValue').click({force: true});
          cy.get(FIELD_deconstructionRuleInput).clear({force: true});
          cy.get(FIELD_deconstructionRuleInput).type('(?<prop1>[0-9]+)', {force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[StructuredValue]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[StructuredValue]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:StructuredValue');
          expect(rdf).to.contain('samm-c:deconstructionRule "(?<prop1>[0-9]+)"');
        });
    });

    it('can switch anonymous Characteristic to Either', () => {
      cy.dbClickShape('[StructuredValue]')
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Either').click({force: true});
          cy.get(FIELD_left).clear({force: true});
          cy.get(FIELD_left).type('LeftCharacteristic', {force: true});
          cy.get('mat-option').contains('LeftCharacteristic').click({force: true});
          cy.get(FIELD_right).clear({force: true});
          cy.get(FIELD_right).type('RightCharacteristic', {force: true});
          cy.get('mat-option').contains('RightCharacteristic').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[Either]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Either]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Either');
          expect(rdf).to.contain('samm-c:left :LeftCharacteristic');
          expect(rdf).to.contain('samm-c:right :RightCharacteristic');
        });
    });

    it('can create anonymous Trait characteristic', () => {
      cy.startModelling()
        .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
        .then(() => cy.shapeExists('Trait1'))
        .then(() => cy.dbClickShape('Trait1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cy.get(FIELD_name).should('have.value', '[Trait]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Trait]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:characteristic [');
          expect(rdf).to.contain('a samm-c:Trait');
          expect(rdf).to.contain('samm-c:baseCharacteristic :Characteristic1');
        });
    });
  });

  describe('Anonymous Constraints and various classes', () => {
    it('can create anonymous EncodingConstraint', () => {
      cy.startModelling()
        .then(() => cy.clickAddTraitPlusIcon('Characteristic1'))
        .then(() => cy.clickAddShapePlusIcon('Trait1'))
        .then(() => cy.shapeExists('EncodingConstraint1'))
        .then(() => cy.dbClickShape('EncodingConstraint1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cy.get(FIELD_name).should('have.value', '[EncodingConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[EncodingConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint [');
          expect(rdf).to.contain('a samm-c:EncodingConstraint');
          expect(rdf).to.contain('samm:value samm:UTF-8');
        });
    });

    it('can switch anonymous Constraint to RegularExpressionConstraint', () => {
      cy.dbClickShape('[EncodingConstraint]')
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('RegularExpressionConstraint').click({force: true});
          cy.get('[data-cy="value"]').clear({force: true});
          cy.get('[data-cy="value"]').type('^[a-zA-Z]+$', {force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[RegularExpressionConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[RegularExpressionConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint');
          expect(rdf).to.contain('a samm-c:RegularExpressionConstraint');
          expect(rdf).to.contain('samm:value "^[a-zA-Z]+$"');
        });
    });

    it('can switch anonymous Constraint to RangeConstraint', () => {
      cy.dbClickShape('[RegularExpressionConstraint]')
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('RangeConstraint').click({force: true});
          cy.get('[data-cy="minValue"]').type('10', {force: true});
          cy.get('[data-cy="maxValue"]').type('100', {force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[RangeConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[RangeConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint');
          expect(rdf).to.contain('a samm-c:RangeConstraint');
          expect(rdf).to.contain('samm-c:minValue "10"');
          expect(rdf).to.contain('samm-c:maxValue "100"');
        });
    });

    it('can switch anonymous Constraint to LengthConstraint', () => {
      cy.dbClickShape('[RangeConstraint]')
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('LengthConstraint').click({force: true});
          cy.get('[data-cy="minValue"]').clear({force: true});
          cy.get('[data-cy="minValue"]').type('2', {force: true});
          cy.get('[data-cy="maxValue"]').clear({force: true});
          cy.get('[data-cy="maxValue"]').type('20', {force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[LengthConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[LengthConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint');
          expect(rdf).to.contain('a samm-c:LengthConstraint');
          expect(rdf).to.contain('samm-c:minValue "2"^^xsd:nonNegativeInteger');
          expect(rdf).to.contain('samm-c:maxValue "20"^^xsd:nonNegativeInteger');
        });
    });

    it('can switch anonymous Constraint to LocaleConstraint', () => {
      cy.dbClickShape('[LengthConstraint]')
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('LocaleConstraint').click({force: true});
          cy.get(FIELD_localeCode).clear({force: true});
          cy.get(FIELD_localeCode).type('de-D', {force: true});
          cy.get('mat-option').contains('de-DE').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[LocaleConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[LocaleConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint');
          expect(rdf).to.contain('a samm-c:LocaleConstraint');
          expect(rdf).to.contain('samm-c:localeCode "de-DE"');
        });
    });

    it('can switch anonymous Constraint to LanguageConstraint', () => {
      cy.dbClickShape('[LocaleConstraint]')
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('LanguageConstraint').click({force: true});
          cy.get(FIELD_languageCode).clear({force: true});
          cy.get(FIELD_languageCode).type('English', {force: true});
          cy.get('mat-option').contains('en').click({force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[LanguageConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[LanguageConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint');
          expect(rdf).to.contain('a samm-c:LanguageConstraint');
          expect(rdf).to.contain('samm-c:languageCode "en"');
        });
    });

    it('can switch anonymous Constraint to FixedPointConstraint', () => {
      cy.dbClickShape('[LanguageConstraint]')
        .then(() => {
          cy.get(FIELD_constraintName).click({force: true});
          cy.get('mat-option').contains('FixedPointConstraint').click({force: true});
          cy.get('[data-cy="scale"]').clear({force: true});
          cy.get('[data-cy="scale"]').type('2', {force: true});
          cy.get('[data-cy="integer"]').clear({force: true});
          cy.get('[data-cy="integer"]').type('5', {force: true});
        })
        .then(() => cy.get(FIELD_name).should('have.value', '[FixedPointConstraint]'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[FixedPointConstraint]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:constraint');
          expect(rdf).to.contain('a samm-c:FixedPointConstraint');
          expect(rdf).to.contain('samm-c:scale');
          expect(rdf).to.contain('samm-c:integer');
        });
    });
  });

  describe('Anonymous SAMM Value in property example and enumerations', () => {
    it('can create anonymous Value in Property exampleValue', () => {
      cy.startModelling()
        .then(() =>
          cy.get('body').then($body => {
            if (!$body.find(SELECTOR_ecValue).length) {
              cy.get(SELECTOR_elementBtn).click();
            }
          }),
        )
        .then(() => cy.dragElement(SELECTOR_ecValue, 350, 300))
        .then(() => cy.shapeExists('Value1'))
        .then(() => cy.clickConnectShapes('property1', 'Value1'))
        .then(() => cy.dbClickShape('Value1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cy.get(FIELD_name).should('have.value', '[Value]'))
        .then(() => cy.get(FIELD_value).clear({force: true}))
        .then(() => cy.get(FIELD_value).type('AnonymousExampleValue', {force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Value]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:exampleValue [');
          expect(rdf).to.contain('a samm:Value');
          expect(rdf).to.contain('samm:value "AnonymousExampleValue"');
        });
    });

    it('can create anonymous Value in Enumeration values list', () => {
      cy.startModelling()
        .then(() =>
          cy.get('body').then($body => {
            if (!$body.find(SELECTOR_ecValue).length) {
              cy.get(SELECTOR_elementBtn).click();
            }
          }),
        )
        .then(() => cy.dragElement(SELECTOR_ecValue, 350, 300))
        .then(() => cy.shapeExists('Value1'))
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true});
          cy.get('mat-option').contains('Enumeration').click({force: true});
          cy.get(FIELD_values).click({force: true});
          cy.get('mat-option').contains('Value1').click({force: true});
        })
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.dbClickShape('Value1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cy.get(FIELD_name).should('have.value', '[Value]'))
        .then(() => cy.get(FIELD_value).clear({force: true}))
        .then(() => cy.get(FIELD_value).type('AnonEnumVal', {force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Value]'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm-c:values');
          expect(rdf).to.contain('a samm:Value');
          expect(rdf).to.contain('samm:value "AnonEnumVal"');
        });
    });
  });

  describe('Deletion of anonymous elements with single and multiple parents', () => {
    it('deleting parent with single anonymous child prompts confirmation and deletes both upon confirmation', () => {
      cy.startModelling()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Characteristic]'))
        .then(() => cy.clickShape('property1'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.get(OK_dialogButton).click({force: true}))
        .then(() => {
          cy.get('[data-cell-name="property1"], [data-cell-id="property1"]').should('not.exist');
          cy.get('[data-cell-name="[Characteristic]"], [data-cell-id="[Characteristic]"]').should('not.exist');
        });
    });

    it('deleting parent with single anonymous child converts to named when "Keep as named" is selected', () => {
      cy.startModelling()
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Characteristic]'))
        .then(() => cy.clickShape('property1'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.get(ACTION_dialogButton).click({force: true}))
        .then(() => {
          cy.get('[data-cell-name="property1"], [data-cell-id="property1"]').should('not.exist');
          cy.get('[data-cell-name="[Characteristic]"], [data-cell-id="[Characteristic]"]').should('not.exist');
          cy.shapeExists('Characteristic1');
        });
    });

    it('does NOT show deletion dialog and does NOT delete anonymous child when it has another parent remaining', () => {
      cy.startModelling()
        .then(() => cyHelp.addNewProperty(2))
        .then(() => cy.dbClickShape('Characteristic1'))
        .then(() => cy.get(SELECTOR_anonymousToggle).find('button, input').first().click({force: true}))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('[Characteristic]'))
        .then(() => cy.clickConnectShapes('property2', '[Characteristic]'))
        .then(() => cy.getAspect())
        .then(aspect => {
          expect(aspect.properties).to.have.length(2);
          expect(aspect.properties[0].characteristic).to.equal(aspect.properties[1].characteristic);
        })
        // Delete property1: remaining parents of [Characteristic] is 1 (property2), so NO confirmation dialog should be shown
        .then(() => cy.clickShape('property1'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => {
          cy.get(OK_dialogButton).should('not.exist');
          cy.get('[data-cell-name="property1"], [data-cell-id="property1"]').should('not.exist');
          // Anonymous characteristic must still exist
          cy.get('[data-cell-name="[Characteristic]"], [data-cell-id="[Characteristic]"]').should('exist');
        })
        // Now delete property2: remaining parents of [Characteristic] is 0, so confirmation dialog SHOULD be shown
        .then(() => cy.clickShape('property2'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.get(OK_dialogButton).click({force: true}))
        .then(() => {
          cy.get('[data-cell-name="property2"], [data-cell-id="property2"]').should('not.exist');
          cy.get('[data-cell-name="[Characteristic]"], [data-cell-id="[Characteristic]"]').should('not.exist');
        });
    });
  });
});
