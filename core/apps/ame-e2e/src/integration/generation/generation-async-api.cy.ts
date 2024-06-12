/* eslint-disable cypress/no-unnecessary-waiting */
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
  GENERATION_tbApplicationIdInput,
  GENERATION_tbChannelAddressInput,
  GENERATION_tbGenerateAsyncApiButton,
  GENERATION_tbOutputButton,
  GENERATION_tbOutputButton_JSON,
  GENERATION_writeSeparateFilesCheckbox,
} from '../../support/constants';

describe('Test generation and download of async api specification', () => {
  it('Can generate valid JSON Async Api Specification', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationAsyncApiSpec().wait(500)).wait(500)
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_JSON).click())
      .then(() => cy.get(GENERATION_tbApplicationIdInput).focus().clear().type('application:id').blur())
      .then(() => cy.get(GENERATION_tbChannelAddressInput).focus().clear().type('foo/bar').blur())
      // .then(() => cy.get(GENERATION_tbGenerateAsyncApiButton).click().wait(5000))
      // .then(() => cy.fixture('cypress/downloads/en-async-api.json'));
  });

  it('Can generate valid YAML Async Api Specification', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationAsyncApiSpec().wait(500))
      .wait(500)
      .then(() => cy.get(GENERATION_tbApplicationIdInput).focus().clear().type('application:id').blur())
      .then(() => cy.get(GENERATION_tbChannelAddressInput).focus().clear().type('foo/bar').blur())
      .then(() => cy.get(GENERATION_tbGenerateAsyncApiButton).click().wait(5000))
      .then(() => cy.fixture('cypress/downloads/en-async-api.yaml'));
  });

  it('Can generate and download valid package for Async Api Specification', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationAsyncApiSpec().wait(500)).wait(500)
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_JSON).click())
      .then(() => cy.get(GENERATION_tbApplicationIdInput).focus().clear().type('application:id').blur())
      .then(() => cy.get(GENERATION_tbChannelAddressInput).focus().clear().type('foo/bar').blur())
      .then(() => cy.get(GENERATION_writeSeparateFilesCheckbox).click())
      .then(() => cy.get(GENERATION_tbGenerateAsyncApiButton).click().wait(5000))
      .then(() => cy.fixture('cypress/downloads/en-async-api.zip'));
  });
});
