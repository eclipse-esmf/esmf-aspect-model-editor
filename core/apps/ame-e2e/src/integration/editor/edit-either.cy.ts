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
  FIELD_descriptionen,
  FIELD_left,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_right,
  META_MODEL_description,
  META_MODEL_preferredName,
  META_MODEL_see,
  SELECTOR_clearLeftCharacteristicButton,
  SELECTOR_editorCancelButton,
  SELECTOR_editorSaveButton,
  SELECTOR_elementBtn,
  SELECTOR_notificationsBtn,
  SELECTOR_notificationsClearButton,
  SELECTOR_notificationsDialogCloseButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test editing Either', () => {
  it('can change to class Either', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Either').click({force: true}))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('Either1', {force: true}))
      .then(() =>
        cy
          .get(FIELD_left)
          .clear({force: true})
          .type('LeftCharacteristic', {force: true})
          .get('mat-option')
          .contains('LeftCharacteristic')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_right)
          .clear({force: true})
          .type('RightCharacteristic', {force: true})
          .get('mat-option')
          .contains('RightCharacteristic')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cyHelp.hasAddLeftAndRightShapeOverlay('Either1'))
      .then(hasAddLeftAndRightShapeOverlay => expect(hasAddLeftAndRightShapeOverlay).equal(true))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.name).to.equal('Either1');
        const either = aspect.properties[0].characteristic;
        expect(either.left.name).to.equal('LeftCharacteristic');
        expect(either.right.name).to.equal('RightCharacteristic');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('Either1 a samm-c:Either');
        expect(rdf).to.contain('samm-c:left :LeftCharacteristic');
        expect(rdf).to.contain('samm-c:right :RightCharacteristic');
        expect(rdf).to.contain('LeftCharacteristic a samm:Characteristic');
        expect(rdf).to.contain('RightCharacteristic a samm:Characteristic');
        expect(rdf).not.contain('samm:dataType');
      });
  });

  it('can edit description', () => {
    cy.shapeExists('Either1')
      .then(() => cy.dbClickShape('Either1'))
      .then(() => {
        cy.get(FIELD_preferredNameen).clear({force: true}).type('new-preferredName', {force: true});
        cy.get(FIELD_descriptionen).clear({force: true}).type('New description for the new created characteristic', {force: true});
        cy.addSeeElements('http://www.see1.de', 'http://www.see2.de', 'http://www.see3.de');
      })
      .then(() => cyHelp.clickSaveButton())
      .then(() => {
        cy.getCellLabel('Either1', META_MODEL_preferredName).should('eq', `${META_MODEL_preferredName} = new-preferredName @en`);
        cy.getCellLabel('Either1', META_MODEL_description).should(
          'eq',
          `${META_MODEL_description} = New description for the new created characteristic @en`,
        );
        cy.getCellLabel('Either1', META_MODEL_see).should(
          'eq',
          `${META_MODEL_see} = http://www.see1.de,http://www.see2.de,http://www.see3.de`,
        );
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('samm:preferredName "new-preferredName"@en');
        expect(rdf).to.contain('samm:description "New description for the new created characteristic"@en');
        expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>');
      })
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.getPreferredName('en')).to.equal('new-preferredName');
        expect(aspect.properties[0].characteristic.getDescription('en')).to.equal('New description for the new created characteristic');
        expect(aspect.properties[0].characteristic.see).to.have.length(3);
        expect(aspect.properties[0].characteristic.see[2]).to.equal('http://www.see3.de');
      });
  });

  it('can remove left and right characteristic connection in edit view', () => {
    cy.dbClickShape('Either1')
      .then(() => cy.get('[data-cy=clear-right-button]').click({force: true}))
      .then(() => cy.get('[data-cy=clear-left-button]').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).should('be.disabled'))
      .then(() =>
        cy
          .get(FIELD_left)
          .clear({force: true})
          .type('NewLeftCharacteristic', {force: true})
          .get('mat-option')
          .contains('LeftCharacteristic')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).should('be.disabled'))
      .then(() =>
        cy
          .get(FIELD_right)
          .clear({force: true})
          .type('NewRightCharacteristic', {force: true})
          .get('mat-option')
          .contains('RightCharacteristic')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.name).to.equal('Either1');
        const either = aspect.properties[0].characteristic;
        expect(either.left.name).to.equal('NewLeftCharacteristic');
        expect(either.right.name).to.equal('NewRightCharacteristic');
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('Either1 a samm-c:Either');
        expect(rdf).to.contain('samm-c:left :NewLeftCharacteristic');
        expect(rdf).to.contain('samm-c:right :NewRightCharacteristic');
        expect(rdf).to.contain('NewLeftCharacteristic a samm:Characteristic');
        expect(rdf).to.contain('NewRightCharacteristic a samm:Characteristic');
        expect(rdf).to.contain('samm:preferredName "new-preferredName"@en');
        expect(rdf).to.contain('samm:description "New description for the new created characteristic"@en');
        expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>');
        expect(rdf).to.contain('LeftCharacteristic a samm:Characteristic');
        expect(rdf).to.contain('RightCharacteristic a samm:Characteristic');
        expect(rdf).not.contain('samm:dataType');
      });
  });

  it('can delete left and right characteristic', () => {
    cy.shapeExists('NewLeftCharacteristic')
      .then(() => cy.clickShape('NewLeftCharacteristic'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.shapeExists('NewRightCharacteristic'))
      .then(() => cy.clickShape('NewRightCharacteristic'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getAspect())
      .then(aspect => {
        expect(aspect.properties[0].characteristic.name).to.equal('Either1');
        const either = aspect.properties[0].characteristic;
        expect(either.left).to.be.null;
        expect(either.right).to.be.null;
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('Either1 a samm-c:Either');
        expect(rdf).to.contain('samm:preferredName "new-preferredName"@en');
        expect(rdf).to.contain('samm:description "New description for the new created characteristic"@en');
        expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>');

        expect(rdf).to.contain('LeftCharacteristic a samm:Characteristic');
        expect(rdf).to.contain('RightCharacteristic a samm:Characteristic');

        expect(rdf).not.contain('samm:dataType');
        expect(rdf).not.contain('samm-c:left :NewLeftCharacteristic');
        expect(rdf).not.contain('samm-c:right :NewRightCharacteristic');
      });
  });

  it('can change to class Characteristic', () => {
    cy.shapeExists('Either1')
      .then(() => cy.dbClickShape('Either1'))
      .then(() =>
        cy
          .get(FIELD_left)
          .clear({force: true})
          .type('LeftCharacteristic', {force: true})
          .get('mat-option')
          .contains('LeftCharacteristic')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_right)
          .clear({force: true})
          .type('RightCharacteristic', {force: true})
          .get('mat-option')
          .contains('RightCharacteristic')
          .click({force: true}),
      )
      .then(() => cyHelp.clickSaveButton())
      .then(() => cy.dbClickShape('Either1'))
      .then(() => {
        cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Characteristic').click({force: true});
        cyHelp.clickSaveButton();
      })
      .then(() => cyHelp.hasAddShapeOverlay('AspectDefault'))
      .then(hasAddOverlay => expect(hasAddOverlay).equal(true))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('Either1 a samm:Characteristic');
        expect(rdf).to.contain('samm:preferredName "new-preferredName"@en');
        expect(rdf).to.contain('samm:description "New description for the new created characteristic"@en');
        expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>');

        expect(rdf).to.contain('LeftCharacteristic a samm:Characteristic');
        expect(rdf).to.contain('RightCharacteristic a samm:Characteristic');

        expect(rdf).not.contain('samm:dataType');
        expect(rdf).not.contain('samm-c:left :LeftCharacteristic');
        expect(rdf).not.contain('samm-c:right :RightCharacteristic');
      });
  });

  it('can add left and right characteristic with shape overlay', () => {
    cy.shapeExists('Either1').then(() => {
      cy.dbClickShape('Either1')
        .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Either').click({force: true}))
        .then(() => cy.get(FIELD_name).clear({force: true}).type('Either1', {force: true}))
        .then(() =>
          cy
            .get(FIELD_left)
            .clear({force: true})
            .type('LeftCharacteristic', {force: true})
            .get('mat-option')
            .contains('LeftCharacteristic')
            .click({force: true}),
        )
        .then(() =>
          cy
            .get(FIELD_right)
            .clear({force: true})
            .type('RightCharacteristic', {force: true})
            .get('mat-option')
            .contains('RightCharacteristic')
            .click({force: true}),
        )
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.shapeExists('LeftCharacteristic'))
        .then(() => cy.clickShape('LeftCharacteristic'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.shapeExists('RightCharacteristic'))
        .then(() => cy.clickShape('RightCharacteristic'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.clickAddLeftShapeIcon('Either1'))
        .then(() => cy.clickAddRightShapeIcon('Either1'))
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('Either1 a samm-c:Either');
          expect(rdf).not.contain('samm-c:left :Characteristic1');
          expect(rdf).not.contain('samm-c:right :Characteristic2');
          expect(rdf).to.contain('samm:preferredName "new-preferredName"@en');
          expect(rdf).to.contain('samm:description "New description for the new created characteristic"@en');
          expect(rdf).to.contain('samm:see <http://www.see1.de>, <http://www.see2.de>, <http://www.see3.de>');

          let noOfDataTypes = 0;
          let startPosition = 0;
          while ((startPosition = (rdf as string).indexOf('samm:dataType', startPosition + 1)) >= 0) {
            noOfDataTypes++;
          }

          expect(noOfDataTypes).to.eq(2);
          expect(rdf).not.contain('samm-c:left :LeftCharacteristic');
          expect(rdf).not.contain('samm-c:right :RightCharacteristic');
        });
    });
  });

  it('can delete existing', () => {
    cy.shapeExists('Either1')
      .then(() => cy.clickShape('Either1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getAspect())
      .then(aspect => assert.isNull(aspect.properties[0].characteristic))
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('Characteristic1 a samm:Characteristic');
        expect(rdf).to.contain('Characteristic2 a samm:Characteristic');
        expect(rdf).not.contain('Either1');
      });
  });

  it('can show error notification with the same characteristic for left and right', () => {
    cy.shapeExists('property1')
      .then(() => cy.clickAddShapePlusIcon('property1'))
      .then(() => cy.dbClickShape('Characteristic3'))
      .then(() => cy.get(SELECTOR_editorCancelButton).focus()) // reactivate change detection
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Either').click({force: true}))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('Either1', {force: true}))
      .then(() =>
        cy
          .get(FIELD_left)
          .clear({force: true})
          .type('NewCharacteristic', {force: true})
          .get('mat-option')
          .contains('NewCharacteristic')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_right)
          .clear({force: true})
          .type('NewCharacteristic', {force: true})
          .get('mat-option')
          .contains('NewCharacteristic')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_notificationsBtn).click({force: true}))
      .then(() => {
        assert(cy.contains('.message-title', 'Element right cannot point to the same characteristic as the left element.'));
        cy.get(SELECTOR_notificationsClearButton).click({force: true});
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      })
      .then(() => cy.get(SELECTOR_clearLeftCharacteristicButton).click({force: true}))
      .then(() =>
        cy
          .get(FIELD_left)
          .clear({force: true})
          .type('Characteristic1', {force: true})
          .get('mat-option')
          .contains('Characteristic1')
          .click({force: true}),
      )
      .then(() =>
        cy
          .get(FIELD_right)
          .clear({force: true})
          .type('Characteristic1', {force: true})
          .get('mat-option')
          .contains('Characteristic1')
          .click({force: true}),
      )
      .then(() => cy.get(SELECTOR_notificationsBtn).click({force: true}))
      .then(() => {
        assert(cy.contains('.message-title', 'Element right cannot point to the same characteristic as the left element.'));
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      });
  });
});
