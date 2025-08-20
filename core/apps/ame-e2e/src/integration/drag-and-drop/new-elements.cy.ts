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
  SELECTOR_ecCharacteristic,
  SELECTOR_ecConstraint,
  SELECTOR_ecEntity,
  SELECTOR_ecOperation,
  SELECTOR_ecProperty,
  SELECTOR_ecTrait,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test drag and drop', () => {
  it('can add new Property', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.dragElement(SELECTOR_ecProperty, 100, 300).then(() => cy.clickShape('property2')));
  });

  it('can add new Operation', () => cy.dragElement(SELECTOR_ecOperation, 350, 300).then(() => cy.clickShape('operation1')));

  it('can add new Trait', () => cy.dragElement(SELECTOR_ecTrait, 350, 300).then(() => cy.clickShape('Trait1')));

  it('can add new Characteristic', () => cy.dragElement(SELECTOR_ecCharacteristic, 350, 300).then(() => cy.clickShape('Characteristic4')));

  it('can add new Constraint', () => cy.dragElement(SELECTOR_ecConstraint, 350, 300).then(() => cy.clickShape('EncodingConstraint2')));

  it('can add new Entity', () => cy.dragElement(SELECTOR_ecEntity, 350, 300).then(() => cy.clickShape('Entity1')));

  it('can connect all', () => {
    cy.clickConnectShapes('AspectDefault', 'property2')
      .then(() => cyHelp.hasAddShapeOverlay('AspectDefault').then(hasAddOverlay => expect(hasAddOverlay).equal(true)))
      .then(() => cy.clickConnectShapes('AspectDefault', 'operation1'))
      .then(() =>
        cyHelp
          .hasAddInputAndOutputShapeOverlay('operation1')
          .then(hasInputAndOutputOverlay => expect(hasInputAndOutputOverlay).equal(true)),
      )

      .then(() => cy.clickConnectShapes('property2', 'Trait1'))
      .then(() => cyHelp.hasAddShapeOverlay('property2').then(hasAddOverlay => expect(hasAddOverlay).equal(false)))
      .then(() => cyHelp.hasAddShapeOverlay('EncodingConstraint1').then(hasAddOverlay => expect(hasAddOverlay).to.equal(false)))
      .then(() => cyHelp.hasAddShapeOverlay('Trait1').then(hasAddOverlay => expect(hasAddOverlay).to.equal(true)))

      .then(() => cy.clickConnectShapes('Characteristic1', 'Entity1'))
      .then(() => cy.clickConnectShapes('Characteristic3', 'Entity1'))
      .then(() => cyHelp.hasAddShapeOverlay('Characteristic1').then(hasAddOverlay => expect(hasAddOverlay).equal(false)))
      .then(() => cyHelp.hasAddShapeOverlay('Entity1').then(hasAddOverlay => expect(hasAddOverlay).to.equal(true)))

      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.operations[0].name).to.equals('operation1');
          expect(aspect.properties[0].name).to.equals('property1');
          expect(aspect.properties[0].characteristic.name).to.equals('Characteristic1');
          expect(aspect.properties[0].characteristic.dataType.name).to.equals('Entity1');
          expect(aspect.properties[1].name).to.equals('property2');
          expect(aspect.properties[1].characteristic.name).to.equals('Trait1');
          expect(aspect.properties[1].characteristic.constraints[0].name).to.equals('EncodingConstraint1');
          expect(aspect.properties[1].characteristic.baseCharacteristic.name).to.equals('Characteristic3');
          expect(aspect.properties[1].characteristic.baseCharacteristic.dataType.name).to.equals('Entity1');
        }),
      );
  });
});
