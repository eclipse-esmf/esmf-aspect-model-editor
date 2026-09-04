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

import {API_BASE_URL, MODELS_API_URL, NAMESPACES_URL, SAMM_VERSION_ACTUAL} from '../../support/api-mocks';
import {SELECTOR_workspaceBtn} from '../../support/constants';

describe('Test workspace file elements filtering', () => {
  beforeEach(() => {
    cy.visitDefault();
    cy.intercept('GET', NAMESPACES_URL, {
      statusCode: 200,
      body: {
        'org.eclipse.examples.aspect': [
          {
            version: '1.0.0',
            models: [
              {
                name: 'AspectDefault.ttl',
                model: 'AspectDefault.ttl',
                aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectDefault',
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
              {
                name: 'AspectElements.ttl',
                model: 'AspectElements.ttl',
                aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectElements',
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
            ],
          },
        ],
      },
    }).as('getNamespaces');

    cy.fixture('all-characteristic').then(rdfString => {
      cy.fixture('/default-models/aspect-default.txt', 'utf-8').then(defaultTtl => {
        cy.intercept('POST', `${API_BASE_URL}/models/batch`, {
          statusCode: 200,
          body: [
            {
              aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectDefault',
              aspectModel: defaultTtl,
              absoluteName: 'org.eclipse.examples.aspect:1.0.0:AspectDefault.ttl',
              fileName: 'AspectDefault.ttl',
              modelVersion: SAMM_VERSION_ACTUAL,
            },
            {
              aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#AspectElements',
              aspectModel: rdfString,
              absoluteName: 'org.eclipse.examples.aspect:1.0.0:AspectElements.ttl',
              fileName: 'AspectElements.ttl',
              modelVersion: SAMM_VERSION_ACTUAL,
            },
          ],
        }).as('batchModels');
      });

      cy.intercept('GET', `${MODELS_API_URL}*`, {
        statusCode: 200,
        body: {content: rdfString, sourceLocation: 'AspectElements.ttl'},
      }).as('getModelElements');
    });

    cy.startModelling();
  });

  it('can open workspace file elements and filter properties, characteristics, and entities', () => {
    // Open workspace sidebar
    cy.get(SELECTOR_workspaceBtn).click({force: true});
    cy.get('ame-workspace-file-list').should('be.visible');

    // Click on the non-current aspect model file in the workspace to view its elements
    cy.get('.file').contains('AspectElements.ttl').click({force: true});

    // File elements view should be visible
    cy.get('ame-workspace-file-elements').should('be.visible');
    cy.get('[data-cy="fileElementsList"]').should('be.visible');

    // Check that sections are initially displayed
    cy.get('[data-cy="section-property"]').should('exist');
    cy.get('[data-cy="section-characteristic"]').should('exist');

    // Open filter menu
    cy.get('[data-cy="elementsFilterBtn"]').click({force: true});
    cy.get('.filter-menu').should('be.visible');

    // Toggle off Property filter
    cy.get('[data-cy="filterCheckbox-property"]').find('input').click({force: true});
    cy.get('[data-cy="section-property"]').should('not.exist');
    cy.get('[data-cy="section-characteristic"]').should('exist');

    // Toggle off Characteristic filter
    cy.get('[data-cy="filterCheckbox-characteristic"]').find('input').click({force: true});
    cy.get('[data-cy="section-characteristic"]').should('not.exist');

    // Toggle back on Property filter
    cy.get('[data-cy="filterCheckbox-property"]').find('input').click({force: true});
    cy.get('[data-cy="section-property"]').should('exist');

    // Toggle back on Characteristic filter
    cy.get('[data-cy="filterCheckbox-characteristic"]').find('input').click({force: true});
    cy.get('[data-cy="section-characteristic"]').should('exist');
  });
});
