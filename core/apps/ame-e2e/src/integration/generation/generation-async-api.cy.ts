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

import {
  GENERATION_tbApplicationIdInput,
  GENERATION_tbChannelAddressInput,
  GENERATION_tbGenerateAsyncApiButton,
  GENERATION_tbOutputButton,
  GENERATION_tbOutputButton_JSON,
  GENERATION_writeSeparateFilesCheckbox,
} from '../../support/constants';

describe('Test generation and download of async api specification', () => {
  before(() => {
    cy.visitDefault();
    cy.startModelling();
  });

  it('Can generate valid JSON Async Api Specification', () => {
    cy.openGenerationAsyncApiSpec()
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_JSON).click())
      .then(() => cy.get(GENERATION_tbApplicationIdInput).clear({force: true}).type('application:id'))
      .then(() => cy.get(GENERATION_tbChannelAddressInput).clear({force: true}).type('foo/bar'))
      .then(() => cy.get(GENERATION_tbGenerateAsyncApiButton).click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault-async-api.json'));
  });

  it('Can generate valid YAML Async Api Specification', () => {
    cy.openGenerationAsyncApiSpec()
      .then(() => cy.get(GENERATION_tbApplicationIdInput).clear({force: true}).type('application:id'))
      .then(() => cy.get(GENERATION_tbChannelAddressInput).clear({force: true}).type('foo/bar'))
      .then(() => cy.get(GENERATION_tbGenerateAsyncApiButton).click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault-async-api.yaml'));
  });

  it('Can generate and download valid package for Async Api Specification', () => {
    cy.openGenerationAsyncApiSpec()
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_JSON).click())
      .then(() => cy.get(GENERATION_tbApplicationIdInput).clear({force: true}).type('application:id'))
      .then(() => cy.get(GENERATION_tbChannelAddressInput).clear({force: true}).type('foo/bar'))
      .then(() => cy.get(GENERATION_writeSeparateFilesCheckbox).click())
      .then(() => cy.get(GENERATION_tbGenerateAsyncApiButton).click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault-async-api.zip'));
  });
});
