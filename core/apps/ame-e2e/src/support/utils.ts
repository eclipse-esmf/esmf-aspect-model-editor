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

import {API_BASE_URL, MODELS_API_URL, NAMESPACES_URL, SAMM_VERSION_ACTUAL} from './api-mocks';
import {SELECTOR_openNamespacesButton, SELECTOR_searchElementsInp, SELECTOR_workspaceBtn} from './constants';
import {cyHelp} from './helpers';

export interface ExternalReferenceOptions {
  fileName: string;
  elementName: string;
  elementSelector: string;
  isSameNamespace?: boolean;
  namespace?: string;
  hasChildren?: boolean;
  searchTerm?: string;
  x?: number;
  y?: number;
  version?: string;
  modelVersion?: string;
}

export function setupExternalReference(options: {
  fileName: string;
  elementName: string;
  isSameNamespace?: boolean;
  namespace?: string;
  hasChildren?: boolean;
  version?: string;
  modelVersion?: string;
}): void {
  const isSame = options.isSameNamespace !== false;
  const namespace = options.namespace ?? (isSame ? 'org.eclipse.examples.aspect' : 'org.eclipse.different');
  const version = options.version ?? '1.0.0';
  const modelVersion = options.modelVersion ?? SAMM_VERSION_ACTUAL;
  const urn = `urn:samm:${namespace}:${version}#${options.elementName}`;
  const nsFolder = isSame ? 'same-namespace' : 'different-namespace';
  const batchFixture = `external-reference/${nsFolder}/without-childrens/${options.fileName}`;
  const modelsFixture = options.hasChildren
    ? `external-reference/${nsFolder}/with-childrens/${options.fileName}`
    : `external-reference/${nsFolder}/without-childrens/${options.fileName}`;

  cy.intercept('GET', NAMESPACES_URL, {
    statusCode: 200,
    body: {
      [namespace]: [
        {
          version,
          models: [
            {
              name: options.fileName,
              model: options.fileName,
              aspectModelUrn: urn,
              version: SAMM_VERSION_ACTUAL,
              existing: true,
            },
          ],
        },
      ],
    },
  });

  cy.fixture(batchFixture).then(fixtureContent => {
    cy.intercept(
      {
        method: 'POST',
        url: `${API_BASE_URL}/models/batch`,
      },
      {
        statusCode: 200,
        body: [
          {
            aspectModelUrn: urn,
            aspectModel: fixtureContent,
            absoluteName: `${namespace}:${version}:${options.fileName}`,
            fileName: options.fileName,
            modelVersion,
          },
        ],
      },
    );
  });

  cy.fixture(modelsFixture).then(fixtureContent => {
    cy.intercept(
      {
        method: 'GET',
        url: MODELS_API_URL,
        headers: {'Aspect-Model-Urn': urn},
      },
      {
        statusCode: 200,
        body: {
          content: fixtureContent,
          sourceLocation: `file:/path/to/${options.fileName}`,
        },
      },
    );
  });
}

export function dragExternalElementFromWorkspace(options: {
  fileName: string;
  searchTerm?: string;
  elementSelector: string;
  x?: number;
  y?: number;
  hasChildren?: boolean;
}): Cypress.Chainable {
  const searchTerm = options.searchTerm ?? options.fileName;
  const x = options.x ?? 100;
  const y = options.y ?? 300;

  return cy
    .startModelling(true)
    .then(() => cyHelp.checkAspectDefaultExists())
    .then(() => cy.get(SELECTOR_workspaceBtn).click())
    .then(() => cy.get('ame-workspace-file-list', {timeout: 15000}).should('be.visible'))
    .then(() => cy.get(SELECTOR_openNamespacesButton).contains(options.fileName).click({force: true}))
    .then(() => cy.get(SELECTOR_searchElementsInp).type(searchTerm))
    .then(() => {
      if (options.hasChildren) {
        return dragExternalReferenceWithChildren(options.elementSelector, x, y);
      }
      return cy.dragElement(options.elementSelector, x, y);
    });
}

export function setupAndDragExternalReference(options: ExternalReferenceOptions): Cypress.Chainable {
  setupExternalReference(options);
  return dragExternalElementFromWorkspace(options);
}

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
  return cy.dragElement(`:nth-child(1) > ${selector}`, x, y);
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
