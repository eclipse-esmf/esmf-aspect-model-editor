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
  SELECTOR_dialogStartButton,
  SELECTOR_enNamespaceList,
  SELECTOR_tbSaveButton,
  SELECTOR_tbSaveMenuExportNamespaceButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {setUpDynamicModellingInterceptors, setUpStaticModellingInterceptors} from '../../support/api-mocks';
import {awaitValidateModelRequest} from '../../support/api-mock-helpers';

describe('Export namespace', () => {
  it('should have all namespaces ready for export from the very start', () => {
    const namespacesConfig = {
      aspectDefault: {
        name: 'org.eclipse.examples.aspect:1.0.0',
        files: [
          {
            name: 'AspectDefault.ttl',
            response: {fixture: '/default-models/aspect-default.txt'},
          },
        ],
      },
      movement: {
        name: 'org.eclipse.examples.movement:1.0.0',
        files: [
          {
            name: 'Movement.ttl',
            response: {fixture: '/default-models/movement.txt'},
          },
        ],
      },
    };

    setUpStaticModellingInterceptors();
    setUpDynamicModellingInterceptors(namespacesConfig);

    cy.visitDefault();
    cy.startModelling().then(() => {
      cy.get(SELECTOR_tbSaveButton).click();
      cy.get(SELECTOR_tbSaveMenuExportNamespaceButton).click();
      cy.get(SELECTOR_enNamespaceList).should('have.length', 2);
      cy.get(SELECTOR_enNamespaceList).contains(namespacesConfig.aspectDefault.name);
      cy.get(SELECTOR_enNamespaceList).contains(namespacesConfig.movement.name);
    });
  });

  it('should have all namespaces ready for export after switching between models', () => {
    const namespacesConfig = {
      aspectDefault: {
        name: 'org.eclipse.examples.aspect:1.0.0',
        files: [
          {
            name: 'AspectDefault.ttl',
            response: {fixture: '/default-models/aspect-default.txt'},
          },
        ],
      },
      movement: {
        name: 'org.eclipse.examples.movement:1.0.0',
        files: [
          {
            name: 'Movement.ttl',
            response: {fixture: '/default-models/movement.txt'},
          },
        ],
      },
    };

    setUpStaticModellingInterceptors();
    setUpDynamicModellingInterceptors(namespacesConfig);

    cy.visitDefault();
    cy.fixture(namespacesConfig.aspectDefault.files[0].response.fixture)
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => {
        cy.get(SELECTOR_dialogStartButton).click();
        return awaitValidateModelRequest(`:AspectDefault`);
      })
      .then(({body}) => {
        namespacesConfig.aspectDefault.files[0].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => cy.fixture(namespacesConfig.movement.files[0].response.fixture))
      .then(rdfString => cyHelp.loadCustomModel(rdfString))
      .then(() => {
        cy.get(SELECTOR_dialogStartButton).click();
        return awaitValidateModelRequest(`:Movement`);
      })
      .then(({body}) => {
        namespacesConfig.movement.files[0].response = body;
        setUpDynamicModellingInterceptors(namespacesConfig);
      })
      .then(() => cy.startModelling())
      .then(() => {
        cy.get(SELECTOR_tbSaveButton).click();
        cy.get(SELECTOR_tbSaveMenuExportNamespaceButton).click();
        cy.get(SELECTOR_enNamespaceList).should('have.length', 2);
        cy.get(SELECTOR_enNamespaceList).contains(namespacesConfig.aspectDefault.name);
        cy.get(SELECTOR_enNamespaceList).contains(namespacesConfig.movement.name);
      });
  });
});
