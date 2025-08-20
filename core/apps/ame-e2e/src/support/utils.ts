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

import {MxGraphAttributeService} from '@ame/mx-graph';
import {cyHelp} from './helpers';

export function connectElements(parent: string, child: string, expected: boolean) {
  return cy
    .clickConnectShapes(parent, child)
    .then(() => cyHelp.hasAddShapeOverlay(parent).then(hasAddOverlay => expect(hasAddOverlay).equal(expected)));
}

export function checkAspectAndChildrenEntity(aspect) {
  expect(aspect.name).to.equal('AspectDefault');
  expect(aspect.properties).to.be.length(1);
  expect(aspect.properties[0].name).to.equal('property1');
  expect(aspect.properties[0].characteristic.name).to.equal('Characteristic1');
  expect(aspect.properties[0].characteristic.dataType.name).to.equal('ExternalEntity');
}

export function checkAspectAndChildrenConstraint(aspect) {
  expect(aspect.name).to.equal('AspectDefault');
  expect(aspect.properties).to.be.length(1);
  expect(aspect.properties[0].name).to.equal('property1');
  expect(aspect.properties[0].characteristic.name).to.equal('Trait1');
  expect(aspect.properties[0].characteristic.baseCharacteristic.name).to.equal('Characteristic2');
  expect(aspect.properties[0].characteristic.constraints[0].name).to.equal('EncodingConstraint1');
  expect(aspect.properties[0].characteristic.constraints[1].name).to.equal('ExternalConstraint');
}

export function checkAspect(aspect) {
  expect(aspect.name).to.equal('AspectDefault');
  expect(aspect.properties).to.be.length(1);
  expect(aspect.properties[0].name).to.equal('property1');
  expect(aspect.properties[0].characteristic.name).to.equal('ExternalCharacteristic');
}

export function checkRelationParentChild(parentModel, parent: string, child: string) {
  expect(parentModel.name).to.equal(parent);
  expect(parentModel.properties).to.be.length(2);
  expect(parentModel.properties[1].name).to.equal(child);
}

export function checkAspectTree(aspect) {
  expect(aspect.name).to.equal('AspectDefault');
  expect(aspect.properties).to.be.length(2);
  expect(aspect.properties[0].name).to.equal('property1');
  expect(aspect.properties[0].characteristic.name).to.equal('Characteristic1');
  expect(aspect.properties[1].name).to.equal('externalPropertyWithChildren');
  expect(aspect.properties[1].characteristic.name).to.equal('ChildrenCharacteristic1');

  const entity = aspect.properties[1].characteristic.dataType;
  expect(entity.name).to.equal('ChildrenEntity1');
  expect(entity.properties).to.be.length(2);
  expect(entity.properties[0].name).to.equal('childrenProperty1');
  expect(entity.properties[1].name).to.equal('childrenProperty2');
  expect(entity.properties[0].characteristic.name).to.equal('ChildrenCharacteristic2');
  expect(entity.properties[0].characteristic.dataType.name).to.equal('ChildrenEntity2');
  expect(entity.properties[1].characteristic.name).to.equal('Boolean');
}

export const dragExternalReferenceWithChildren = (selector: string, x: number, y: number) => {
  cy.getMxgraphAttributeService().then((service: MxGraphAttributeService) => {
    const container = service.graph.container;
    const {scrollLeft, scrollTop} = container;

    const graphX = scrollLeft + x;
    const graphY = scrollTop + y;

    if (Cypress.platform === 'darwin') {
      cy.get(':nth-child(1) > ' + selector).trigger('mousedown', {which: 1});
      cy.get(':nth-child(1) > ' + selector).trigger('mousemove', {clientX: graphX, clientY: graphY, waitForAnimations: true});
      cy.get('#graph > svg').click(graphX, graphY, {force: true});
      cy.get('#graph > svg').trigger('mouseup', {force: true});
    } else {
      cy.get(':nth-child(1) > ' + selector).trigger('pointerdown', {which: 1});
      cy.get(':nth-child(1) > ' + selector).trigger('pointermove', {
        clientX: graphX,
        clientY: graphY,
        waitForAnimations: true,
      });
      cy.get('#graph > svg').click(graphX, graphY, {force: true});
      cy.get('#graph > svg').trigger('pointerup', {force: true});
    }
  });
};

export const loadModel = (fixturePath: string) => {
  cy.fixture(fixturePath).then(rdfString => cy.loadModel(rdfString));
};

export const openElementAndAssertValues = (shape: string, testCases: Array<any>) => {
  cy.dbClickShape(shape).then(() => {
    testCases.forEach(testCase => {
      verifyColumnValues(testCase.dataCy, testCase.expectedKeyValues);
    });
  });
};

export const assertRdf = (testCases: Array<any>) => {
  cy.getUpdatedRDF().then(rdf => {
    testCases.forEach(testCase => {
      testCase.rdfAssertions.forEach((assertion: string) => {
        expect(rdf).to.contain(assertion);
      });
    });
  });
};

export const verifyColumnValues = (dataCy: string, expectedKeyValues: Array<any>) => {
  expectedKeyValues.forEach((keyValue, index) => {
    cy.get(`[data-cy="${dataCy}"] .cdk-column-key`).eq(index).should('contain', keyValue.key);
    cy.get(`[data-cy="${dataCy}"] .cdk-column-value`).eq(index).should('contain', keyValue.value);
  });
};
