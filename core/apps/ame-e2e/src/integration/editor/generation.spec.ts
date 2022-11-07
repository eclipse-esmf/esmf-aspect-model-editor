/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
  GENERATION_tbDownloadDoc,
  GENERATION_tbGenerateOpenApiButton,
  GENERATION_tbOutputButton,
  SELECTOR_tbGenerateDocumentButton,
  SELECTOR_tbOpenApiButton,
  SELECTOR_tbPrintButton,
} from '../../support/constants';

describe('Test generation and download from valid Aspect Model', () => {
  it('Can generate valid JSON Open Api Specification', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept(
      'POST',
      'http://localhost:9091/ame/api/generate/open-api-spec?output=json&baseUrl=https://example.com&includeQueryApi=false&pagingOption=NO_PAGING',
      {fixture: 'valid-open-api.json'}
    );
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).click({force: true}))
      .then(() => cy.get(SELECTOR_tbOpenApiButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click({force: true}))
      .then(() => cy.readFile('cypress/downloads/AspectDefault-open-api.json').should('exist'));
  });

  it('Can generate and download valid YAML Open Api Specification', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept(
      'POST',
      'http://localhost:9091/ame/api/generate/open-api-spec?output=yaml&baseUrl=https://example.com&includeQueryApi=false&pagingOption=NO_PAGING',
      {fixture: 'valid-open-api.yaml'}
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).click({force: true}))
      .then(() => cy.get(SELECTOR_tbOpenApiButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbOutputButton).select('YAML'))
      .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click({force: true}))
      .then(() => cy.readFile('cypress/downloads/AspectDefault-open-api.yaml').should('exist'));
  });

  it('Can generate and download valid Aspect Model documentation', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('POST', 'http://localhost:9091/ame/api/generate/documentation', {fixture: 'valid-documentation.html'});
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).click({force: true}))
      .then(() => cy.get(SELECTOR_tbPrintButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbDownloadDoc).click({force: true}))
      .then(() => cy.readFile('cypress/downloads/AspectDefault-documentation.html').should('exist'));
  });
});
