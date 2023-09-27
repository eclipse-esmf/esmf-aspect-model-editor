/* eslint-disable cypress/no-unnecessary-waiting */
/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  BUTTON_renameModelConfirm,
  FIELD_renameModelInput,
  SELECTOR_dialogStartButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {setUpDynamicModellingInterceptors, setUpStaticModellingInterceptors} from '../../support/api-mocks';
import {awaitFormatModelRequest} from '../../support/api-mock-helpers';

/**
 * Take into consideration that these tests do not use real backend and verify
 * only the behavior of a client-side part in isolation, backend responses are mocked
 */

// disabled until cypress team fixes cy.readFile
describe.skip('Test modifying referenced model', () => {
  it('Moves referenced model from different namespace to a new one, migrates dependent models', () => {
    const sharedModelExpectationFile =
      'apps/ame-e2e/src/fixtures/workspaces/referenced-models-different-namespaces/parsed-models/shared-model-changed-namespace/aspect-shared-different-namespaces.json';
    const dependentModelExpectationFile =
      'apps/ame-e2e/src/fixtures/workspaces/referenced-models-different-namespaces/parsed-models/shared-model-changed-namespace/aspect-dependent-different-namespaces.json';
    const newNamespaceName = 'newNamespace';
    const newNamespaceVersion = '1.0.0';
    const newNamespace = `${newNamespaceName}:${newNamespaceVersion}`;
    const newUrn = `urn:samm:${newNamespace}`;
    const namespacesConfig = {
      shared: {
        name: 'different.namespace:1.0.0',
        files: [
          {
            name: 'AspectSharedDifferentNamespaces.ttl',
            response: {fixture: '/workspaces/referenced-models-different-namespaces/aspect-shared-different-namespaces.txt'},
          },
        ],
      },
      dependent: {
        name: 'org.eclipse.digitaltwin:1.0.0',
        files: [
          {
            name: 'AspectDependentDifferentNamespaces.ttl',
            response: {fixture: '/workspaces/referenced-models-different-namespaces/aspect-dependent-different-namespaces.txt'},
          },
        ],
      },
    };

    setUpStaticModellingInterceptors();
    setUpDynamicModellingInterceptors(namespacesConfig);

    cy.visitDefault();
    cy.fixture(namespacesConfig.shared.files[0].response.fixture)
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click().wait(1000))
      .then(() => cy.getAspect())
      .then(() => {
        cyHelp.updateNamespace(newNamespaceName, newNamespaceVersion);
        cyHelp.saveCurrentModelToWorkspace();
        cy.get('button').contains('Continue').click();
      })
      .then(() => awaitFormatModelRequest(`@prefix ext-namespace: <${newUrn}#>`))
      .then(({body}) => {
        // Update interceptors to return the most recent value
        namespacesConfig.dependent.files[0].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => awaitFormatModelRequest(`@prefix : <${newUrn}#>`))
      .then(({body}) => {
        // Update interceptors to return the most recent value
        namespacesConfig.shared.files[0].response = body;
        namespacesConfig.shared.name = newNamespace;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => {
        // Trigger namespaces update in order to get the latest stubbed values from interceptors
        cyHelp.saveCurrentModelToWorkspace();
        cy.get('button').contains('Overwrite').click();
        cyHelp.loadModelFromWorkspace(namespacesConfig.dependent.name, namespacesConfig.dependent.files[0].name);
        return cy.getAspect();
      })
      .then(expected => {
        cy.readFile(dependentModelExpectationFile).then(expectation => {
          expect(expected.aspectModelUrn).to.equal(expectation.aspectModelUrn);
        });
      })
      .then(() => {
        cyHelp.loadModelFromWorkspace(namespacesConfig.shared.name, namespacesConfig.shared.files[0].name);
        return cy.getAspect();
      })
      .then(expected =>
        cy.readFile(sharedModelExpectationFile).then(expectation => expect(expected.aspectModelUrn).to.equal(expectation.aspectModelUrn))
      );
  });

  it('Moves referenced model from the same namespace to a new one, migrates dependent models', () => {
    const sharedModelExpectationFile =
      'apps/ame-e2e/src/fixtures/workspaces/referenced-models-same-namespace/parsed-models/shared-model-changed-namespace/aspect-shared-same-namespaces.json';
    const dependentModelExpectationFile =
      'apps/ame-e2e/src/fixtures/workspaces/referenced-models-same-namespace/parsed-models/shared-model-changed-namespace/aspect-dependent-same-namespaces.json';
    const newNamespaceName = 'newNamespace';
    const newNamespaceVersion = '1.0.0';
    const newNamespace = `${newNamespaceName}:${newNamespaceVersion}`;
    const newUrn = `urn:samm:${newNamespace}`;
    const namespacesConfig = {
      same: {
        name: 'same.namespace:1.0.0',
        files: [
          {
            name: 'AspectSharedSameNamespace.ttl',
            response: {fixture: '/workspaces/referenced-models-same-namespace/aspect-shared-same-namespace.txt'},
          },
          {
            name: 'AspectDependentSameNamespace.ttl',
            response: {fixture: '/workspaces/referenced-models-same-namespace/aspect-dependent-same-namespace.txt'},
          },
        ],
      },
    };

    setUpStaticModellingInterceptors();
    setUpDynamicModellingInterceptors(namespacesConfig);

    cy.visitDefault();
    cy.fixture(namespacesConfig.same.files[0].response.fixture)
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => cy.get(SELECTOR_dialogStartButton).click().wait(1000))
      .then(() => cy.getAspect())
      .then(() => {
        cyHelp.updateNamespace(newNamespaceName, newNamespaceVersion);
        cyHelp.saveCurrentModelToWorkspace();
        cy.get('button').contains('Continue').click();
      })
      .then(() => awaitFormatModelRequest(`@prefix ext-namespace: <${newUrn}#>`))
      .then(({body}) => {
        // Update interceptors to return the most recent value
        namespacesConfig.same.files[1].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => awaitFormatModelRequest(`@prefix : <${newUrn}#>`))
      .then(({body}) => {
        // Update interceptors to return the most recent value
        namespacesConfig[newNamespaceName] = {
          name: `${newNamespaceName}:${newNamespaceVersion}`,
          files: [
            {
              name: 'AspectSharedSameNamespace.ttl',
              response: body,
            },
          ],
        };
        namespacesConfig.same.files = [namespacesConfig.same.files[1]];
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => {
        // Trigger namespaces update in order to get the latest stubbed values from interceptors
        cyHelp.saveCurrentModelToWorkspace();
        cy.get('button').contains('Overwrite').click();
        cyHelp.loadModelFromWorkspace(namespacesConfig.same.name, namespacesConfig.same.files[0].name);
        return cy.getAspect();
      })
      .then(expected => {
        cy.readFile(dependentModelExpectationFile).then(expectation =>
          expect(expected.aspectModelUrn).to.equal(expectation.aspectModelUrn)
        );
      })
      .then(() => {
        cyHelp.loadModelFromWorkspace(namespacesConfig[newNamespaceName].name, namespacesConfig[newNamespaceName].files[0].name);
        return cy.getAspect();
      })
      .then(expected =>
        cy.readFile(sharedModelExpectationFile).then(expectation => expect(expected.aspectModelUrn).to.equal(expectation.aspectModelUrn))
      );
  });

  it('Moves shared model to a different namespace', () => {
    const sharedModelName = 'SHARED';
    const sharedModelFileName = `${sharedModelName}.ttl`;
    const namespacesConfig = {
      main: {
        name: 'org.eclipse.digitaltwin:1.0.0',
        files: [
          {
            name: 'AspectDefault.ttl',
            response: {},
          },
        ],
      },
    };

    setUpStaticModellingInterceptors();
    setUpDynamicModellingInterceptors(namespacesConfig);

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.getAspect())
      .then(({body}) => {
        namespacesConfig.main.files[0].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => {
        cyHelp.saveCurrentModelToWorkspace();
        cy.get('button').contains('Overwrite').click();
      })
      .then(() => awaitFormatModelRequest(''))
      .then(({body}) => {
        // Update interceptors to return the most recent value
        namespacesConfig.main.files[0].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click())
      .then(() => cy.get(FIELD_renameModelInput).type(sharedModelName))
      .then(() => cy.get(BUTTON_renameModelConfirm).click().wait(500))
      .then(() => cyHelp.saveCurrentModelToWorkspace())
      .then(() => awaitFormatModelRequest(''))
      .then(({body}) => {
        // Update interceptors to return the most recent value
        namespacesConfig.main.files[0].name = sharedModelFileName;
        namespacesConfig.main.files[0].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => {
        // Trigger namespaces update in order to get the latest stubbed values from interceptors
        cyHelp.saveCurrentModelToWorkspace();
        cy.get('button').contains('Overwrite').click();
        return cy.getAspect();
      })
      .then(aspect => {
        expect(!!aspect).to.equal(false);
      });
  });
});
