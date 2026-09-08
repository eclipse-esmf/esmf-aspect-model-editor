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

import {GENERATION_downloadFileButton} from '../../support/constants';

describe('Test generation and download of Json payload/schema', () => {
  before(() => {
    cy.visitDefault();
    cy.startModelling();
  });

  it('Can generate and download valid Json payload', () => {
    cy.openGenerationJsonSample()
      .then(() => cy.get(GENERATION_downloadFileButton).should('be.visible').click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault-sample.json'))
      .then(() => cy.get('button.close-button').click({force: true}));
  });

  it('Can generate and download valid Json schema', () => {
    cy.openGenerationJsonSchema()
      .then(() => cy.get(GENERATION_downloadFileButton).should('be.visible').click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault-schema.json'))
      .then(() => cy.get('button.close-button').click({force: true}));
  });
});
