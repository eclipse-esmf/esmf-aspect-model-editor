/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {
  FIELD_characteristicName,
  FIELD_descriptionen,
  FIELD_left,
  FIELD_name,
  FIELD_preferredNameen,
  FIELD_right,
  FIELD_see,
  META_MODEL_description,
  META_MODEL_preferredName,
  META_MODEL_see,
  SELECTOR_clearLeftCharacteristicButton,
  SELECTOR_editorSaveButton,
  SELECTOR_nbNotificationsButton,
  SELECTOR_notificationsClearButton,
  SELECTOR_notificationsDialogCloseButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {mxgraph} from 'mxgraph-factory';
import {Aspect, DefaultEither} from '@bame/meta-model';
import {cyHelp} from '../../support/helpers';

describe('Test editing Either', () => {
  it('can change to class Either', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.dbClickShape('Characteristic1'))
      .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Either').click({force: true}))
      .then(() => cy.get(FIELD_name).clear().type('Either1'))
      .then(() =>
        cy.get(FIELD_left).clear().type('LeftCharacteristic').get('mat-option').contains('LeftCharacteristic').click({force: true})
      )
      .then(() =>
        cy.get(FIELD_right).clear().type('RightCharacteristic').get('mat-option').contains('RightCharacteristic').click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => cyHelp.hasAddLeftAndRightShapeOverlay('Either1'))
      .then(hasAddLeftAndRightShapeOverlay => expect(hasAddLeftAndRightShapeOverlay).equal(true))
      .then(() => {
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Either1');
          const either = <DefaultEither>aspect.properties[0].property.characteristic;
          expect(either.left.name).to.equal('LeftCharacteristic');
          expect(either.right.name).to.equal('RightCharacteristic');
        });
      })
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Either1 a bamm-c:Either');
          expect(rdf).to.contain('bamm-c:left :LeftCharacteristic');
          expect(rdf).to.contain('bamm-c:right :RightCharacteristic');
          expect(rdf).to.contain('LeftCharacteristic a bamm:Characteristic');
          expect(rdf).to.contain('RightCharacteristic a bamm:Characteristic');

          expect(rdf).not.contain('bamm:dataType');
        });
      });
  });

  it('can edit description', () => {
    cy.shapeExists('Either1').then(() => {
      cy.dbClickShape('Either1').then((shape: mxgraph.mxCell) => {
        cy.get(FIELD_preferredNameen).clear().type('new-preferredName');
        cy.get(FIELD_descriptionen).clear().type('New description for the new created characteristic');
        cy.get(FIELD_see).clear().type('http://www.see1.de,http://www.see2.de,http://www.see3.de');
        cy.get(SELECTOR_editorSaveButton)
          .focus()
          .click({force: true})
          .then(() => {
            cy.getCellLabel(shape, META_MODEL_preferredName).then(cellLabel =>
              expect(cellLabel).to.contain(`${META_MODEL_preferredName} = new-preferredName @en`)
            );
            cy.getCellLabel(shape, META_MODEL_description).then(cellLabel =>
              expect(cellLabel).to.contain(`${META_MODEL_description} = New description for the new created characteristic @en`)
            );
            cy.getCellLabel(shape, META_MODEL_see).then(cellLabel =>
              expect(cellLabel).to.contain(`${META_MODEL_see} = http://www.see1.de,http://www.see2.de,http://www.see3.de`)
            );
          })
          .then(() => {
            cy.getUpdatedRDF()
              .then(rdf => {
                expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en');
                expect(rdf).to.contain('bamm:description "New description for the new created characteristic"@en');
                expect(rdf).to.contain('bamm:see <http%3A%2F%2Fwww.see1.de>, <http%3A%2F%2Fwww.see2.de>, <http%3A%2F%2Fwww.see3.de>');
              })
              .then(() => {
                cy.getAspect().then(aspect => {
                  expect(aspect.properties[0].property.characteristic.getPreferredName('en')).to.equal('new-preferredName');
                  expect(aspect.properties[0].property.characteristic.getDescription('en')).to.equal(
                    'New description for the new created characteristic'
                  );
                  expect(aspect.properties[0].property.characteristic.getSeeReferences()).to.have.length(3);
                  expect(aspect.properties[0].property.characteristic.getSeeReferences()[2]).to.equal('http://www.see3.de');
                });
              });
          });
      });
    });
  });

  it('can remove left and right characteristic connection in edit view', () => {
    cy.dbClickShape('Either1')
      .then(() => cy.get('[data-cy=clear-right-button]').click({force: true}))
      .then(() => cy.get('[data-cy=clear-left-button]').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).should('be.disabled'))
      .then(() =>
        cy.get(FIELD_left).clear().type('NewLeftCharacteristic').get('mat-option').contains('LeftCharacteristic').click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).should('be.disabled'))
      .then(() =>
        cy.get(FIELD_right).clear().type('NewRightCharacteristic').get('mat-option').contains('RightCharacteristic').click({force: true})
      )
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() => {
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Either1');
          const either = <DefaultEither>aspect.properties[0].property.characteristic;
          expect(either.left.name).to.equal('NewLeftCharacteristic');
          expect(either.right.name).to.equal('NewRightCharacteristic');
        });
      })
      .then(() => {
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Either1 a bamm-c:Either');
          expect(rdf).to.contain('bamm-c:left :NewLeftCharacteristic');
          expect(rdf).to.contain('bamm-c:right :NewRightCharacteristic');
          expect(rdf).to.contain('NewLeftCharacteristic a bamm:Characteristic');
          expect(rdf).to.contain('NewRightCharacteristic a bamm:Characteristic');
          expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en');
          expect(rdf).to.contain('bamm:description "New description for the new created characteristic"@en');
          expect(rdf).to.contain('bamm:see <http%3A%2F%2Fwww.see1.de>, <http%3A%2F%2Fwww.see2.de>, <http%3A%2F%2Fwww.see3.de>');

          expect(rdf).to.contain('LeftCharacteristic a bamm:Characteristic');
          expect(rdf).to.contain('RightCharacteristic a bamm:Characteristic');

          expect(rdf).not.contain('bamm:dataType');
        });
      });
  });

  it('can delete left and right characteristic', () => {
    cy.shapeExists('NewLeftCharacteristic')
      .then(() => cy.clickShape('NewLeftCharacteristic'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.shapeExists('NewRightCharacteristic'))
      .then(() => cy.clickShape('NewRightCharacteristic'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.properties[0].property.characteristic.name).to.equal('Either1');
          const either = <DefaultEither>aspect.properties[0].property.characteristic;
          expect(either.left).to.be.null;
          expect(either.right).to.be.null;
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain('Either1 a bamm-c:Either');
          expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en');
          expect(rdf).to.contain('bamm:description "New description for the new created characteristic"@en');
          expect(rdf).to.contain('bamm:see <http%3A%2F%2Fwww.see1.de>, <http%3A%2F%2Fwww.see2.de>, <http%3A%2F%2Fwww.see3.de>');

          expect(rdf).to.contain('LeftCharacteristic a bamm:Characteristic');
          expect(rdf).to.contain('RightCharacteristic a bamm:Characteristic');

          expect(rdf).not.contain('bamm:dataType');
          expect(rdf).not.contain('bamm-c:left :NewLeftCharacteristic');
          expect(rdf).not.contain('bamm-c:right :NewRightCharacteristic');
        })
      );
  });

  it('can change to class Characteristic', () => {
    cy.shapeExists('Either1').then(() => {
      cy.dbClickShape('Either1')
        .then(() =>
          cy.get(FIELD_left).clear().type('LeftCharacteristic').get('mat-option').contains('LeftCharacteristic').click({force: true})
        )
        .then(() =>
          cy.get(FIELD_right).clear().type('RightCharacteristic').get('mat-option').contains('RightCharacteristic').click({force: true})
        )
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.dbClickShape('Either1'))
        .then(() => {
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Characteristic').click({force: true});
          cy.get(SELECTOR_editorSaveButton).focus().click({force: true});
        })
        .then(() => cyHelp.hasAddShapeOverlay('AspectDefault'))
        .then(hasAddOverlay => expect(hasAddOverlay).equal(true))
        .then(() => {
          cy.getUpdatedRDF().then(rdf => {
            expect(rdf).to.contain('Either1 a bamm:Characteristic');
            expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en');
            expect(rdf).to.contain('bamm:description "New description for the new created characteristic"@en');
            expect(rdf).to.contain('bamm:see <http%3A%2F%2Fwww.see1.de>, <http%3A%2F%2Fwww.see2.de>, <http%3A%2F%2Fwww.see3.de>');

            expect(rdf).to.contain('LeftCharacteristic a bamm:Characteristic');
            expect(rdf).to.contain('RightCharacteristic a bamm:Characteristic');

            expect(rdf).not.contain('bamm:dataType');
            expect(rdf).not.contain('bamm-c:left :LeftCharacteristic');
            expect(rdf).not.contain('bamm-c:right :RightCharacteristic');
          });
        });
    });
  });

  it('can add left and right characteristic with shape overlay', () => {
    cy.shapeExists('Either1').then(() => {
      cy.dbClickShape('Either1')
        .then(() => cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Either').click({force: true}))
        .then(() => cy.get(FIELD_name).clear().type('Either1'))
        .then(() =>
          cy.get(FIELD_left).clear().type('LeftCharacteristic').get('mat-option').contains('LeftCharacteristic').click({force: true})
        )
        .then(() =>
          cy.get(FIELD_right).clear().type('RightCharacteristic').get('mat-option').contains('RightCharacteristic').click({force: true})
        )
        .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
        .then(() => cy.shapeExists('LeftCharacteristic'))
        .then(() => cy.clickShape('LeftCharacteristic'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.shapeExists('RightCharacteristic'))
        .then(() => cy.clickShape('RightCharacteristic'))
        .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
        .then(() => cy.clickAddLeftShapeIcon('Either1'))
        .then(() => cy.clickAddRightShapeIcon('Either1'))
        .then(() => {
          cy.getUpdatedRDF().then(rdf => {
            expect(rdf).to.contain('Either1 a bamm-c:Either');
            expect(rdf).not.contain('bamm-c:left :Characteristic1');
            expect(rdf).not.contain('bamm-c:right :Characteristic2');
            expect(rdf).to.contain('bamm:preferredName "new-preferredName"@en');
            expect(rdf).to.contain('bamm:description "New description for the new created characteristic"@en');
            expect(rdf).to.contain('bamm:see <http%3A%2F%2Fwww.see1.de>, <http%3A%2F%2Fwww.see2.de>, <http%3A%2F%2Fwww.see3.de>');

            expect(rdf).not.contain('bamm:dataType');
            expect(rdf).not.contain('bamm-c:left :LeftCharacteristic');
            expect(rdf).not.contain('bamm-c:right :RightCharacteristic');
          });
        });
    });
  });

  it('can delete existing', () => {
    cy.shapeExists('Either1').then(() => {
      cy.clickShape('Either1').then(() => {
        cy.get(SELECTOR_tbDeleteButton)
          .click({force: true})
          .then(() => {
            cy.getAspect().then((aspect: Aspect) => {
              assert.isNull(aspect.properties[0].property.characteristic);
            });
            cy.getUpdatedRDF().then(rdf => {
              expect(rdf).to.contain('Characteristic1 a bamm:Characteristic');
              expect(rdf).to.contain('Characteristic2 a bamm:Characteristic');

              expect(rdf).not.contain('Either1');
            });
          });
      });
    });
  });

  it('can show error notification with the same characteristic for left and right', () => {
    cy.shapeExists('property1').then(() => {
      cy.clickAddShapePlusIcon('property1').then(() => {
        cy.dbClickShape('Characteristic3').then(() =>
          cy.get(FIELD_characteristicName).click({force: true}).get('mat-option').contains('Either').click({force: true}))
          .then(() => cy.get(FIELD_name).clear().type('Either1'))
          .then(() =>
            cy.get(FIELD_left).clear().type('NewCharacteristic').get('mat-option').contains('NewCharacteristic').click({force: true})
          )
          .then(() =>
            cy.get(FIELD_right).clear().type('NewCharacteristic').get('mat-option').contains('NewCharacteristic').click({force: true})
          )
          .then(() => {
            cy.get(SELECTOR_nbNotificationsButton)
              .click({force: true})
              .then(() => {
                assert(cy.contains('.message-title', 'Element right cannot point to the same characteristic as the left element.'));
                cy.get(SELECTOR_notificationsClearButton).click({force: true});
                cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
              });
          })
          .then(() => {
            cy.get(SELECTOR_clearLeftCharacteristicButton).click({force: true});
          })
          .then(() =>
            cy.get(FIELD_left).clear().type('Characteristic1').get('mat-option').contains('Characteristic1').click({force: true})
          )
          .then(() =>
            cy.get(FIELD_right).clear().type('Characteristic1').get('mat-option').contains('Characteristic1').click({force: true})
          )
          .then(() => {
            cy.get(SELECTOR_nbNotificationsButton)
              .click({force: true})
              .then(() => {
                assert(cy.contains('.message-title', 'Element right cannot point to the same characteristic as the left element.'));
                cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
              });
          });
      });
    });
  });
});
