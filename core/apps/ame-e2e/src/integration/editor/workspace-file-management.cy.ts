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

import {API_BASE_URL, NAMESPACES_URL, SAMM_VERSION_ACTUAL} from '../../support/api-mocks';
import {
  SELECTOR_openFileMenu,
  SELECTOR_workspaceBtn,
  SELECTOR_workspaceRefreshButton,
  SELECTOR_workspaceSearchInput,
  SELECTOR_workspaceToggleFold,
  SIDEBAR_CLOSE_BUTTON,
} from '../../support/constants';

describe('Test workspace file management', () => {
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
                name: 'Movement.ttl',
                model: 'Movement.ttl',
                aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#Movement',
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
            ],
          },
          {
            version: '2.0.0',
            models: [
              {
                name: 'Vehicle.ttl',
                model: 'Vehicle.ttl',
                aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:2.0.0#Vehicle',
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
            ],
          },
        ],
        'org.eclipse.examples.shared': [
          {
            version: '1.0.0',
            models: [
              {
                name: 'SharedUnits.ttl',
                model: 'SharedUnits.ttl',
                aspectModelUrn: 'urn:samm:org.eclipse.examples.shared:1.0.0#SharedUnits',
                version: SAMM_VERSION_ACTUAL,
                existing: true,
              },
            ],
          },
        ],
      },
    }).as('getNamespaces');

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
            aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:1.0.0#Movement',
            aspectModel: defaultTtl,
            absoluteName: 'org.eclipse.examples.aspect:1.0.0:Movement.ttl',
            fileName: 'Movement.ttl',
            modelVersion: SAMM_VERSION_ACTUAL,
          },
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples.aspect:2.0.0#Vehicle',
            aspectModel: defaultTtl,
            absoluteName: 'org.eclipse.examples.aspect:2.0.0:Vehicle.ttl',
            fileName: 'Vehicle.ttl',
            modelVersion: SAMM_VERSION_ACTUAL,
          },
          {
            aspectModelUrn: 'urn:samm:org.eclipse.examples.shared:1.0.0#SharedUnits',
            aspectModel: defaultTtl,
            absoluteName: 'org.eclipse.examples.shared:1.0.0:SharedUnits.ttl',
            fileName: 'SharedUnits.ttl',
            modelVersion: SAMM_VERSION_ACTUAL,
          },
        ],
      }).as('batchModels');
    });

    cy.startModelling();
    cy.get(SELECTOR_workspaceBtn).click({force: true});
  });

  it('can view workspace file list and filter by search', () => {
    cy.get('ame-workspace-file-list').should('be.visible');
    cy.get('.file').should('have.length.at.least', 3);

    // Filter by search string
    cy.get(SELECTOR_workspaceSearchInput).type('Vehicle');
    cy.get('.file').should('have.length', 1);
    cy.get('.file').should('contain', 'Vehicle');

    // Clear search filter
    cy.get(SELECTOR_workspaceSearchInput).clear();
    cy.get('.file').should('have.length.at.least', 3);
  });

  it('can toggle fold/unfold on workspace namespaces', () => {
    cy.get(SELECTOR_workspaceToggleFold).click({force: true});
    cy.get(SELECTOR_workspaceToggleFold).click({force: true});
    cy.get('.file').should('be.visible');
  });

  it('can open file context menu in workspace', () => {
    cy.get(SELECTOR_openFileMenu).first().click({force: true});
    cy.get('[data-cy="fileMenuCopyToClipboardButton"]').should('be.visible');
    cy.get('[data-cy="fileMenuDeleteButton"]').should('be.visible');
  });

  it('can refresh workspace and close sidebar', () => {
    cy.get(SELECTOR_workspaceRefreshButton).click({force: true});
    cy.get(SIDEBAR_CLOSE_BUTTON).click({force: true});
    cy.get('ame-workspace-file-list').should('not.exist');
  });
});
