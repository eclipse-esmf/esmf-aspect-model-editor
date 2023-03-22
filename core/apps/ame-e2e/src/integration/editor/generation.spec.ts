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
  GENERATION_tbDownloadDoc,
  GENERATION_tbGenerateOpenApiButton,
  GENERATION_tbOutputButton,
  GENERATION_tbOutputButton_YAML,
  SELECTOR_tbDeleteButton,
  SELECTOR_tbGenerateDocumentButton,
  SELECTOR_tbOpenApiButton,
  SELECTOR_tbPrintButton,
} from '../../support/constants';

describe('Test generation and download from valid Aspect Model', () => {
  it('Can generate valid JSON Open Api Specification', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept(
      'POST',
      'http://localhost:9091/ame/api/generate/open-api-spec?language=en&output=json&baseUrl=https://example.com&includeQueryApi=false&pagingOption=NO_PAGING',
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
      'http://localhost:9091/ame/api/generate/open-api-spec?language=en&output=yaml&baseUrl=https://example.com&includeQueryApi=false&pagingOption=NO_PAGING',
      {fixture: 'valid-open-api.yaml'}
    );

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).click({force: true}))
      .then(() => cy.get(SELECTOR_tbOpenApiButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_YAML).click())
      .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click({force: true}))
      .then(() => cy.readFile('cypress/downloads/AspectDefault-open-api.yaml').should('exist'));
  });

  it('Can generate and download valid Aspect Model documentation', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('POST', 'http://localhost:9091/ame/api/generate/documentation?language=en', {fixture: 'valid-documentation.html'});
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).click({force: true}))
      .then(() => cy.get(SELECTOR_tbPrintButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbDownloadDoc).click({force: true}))
      .then(() => cy.readFile('cypress/downloads/AspectDefault-documentation.html').should('exist'));
  });

  it('Cannot generate valid shared Aspect Model', () => {
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.different:1.0.0': ['external-property-reference.txt'],
    });

    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.getHTMLCell('AspectDefault').click({force: true}))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get(FIELD_renameModelInput).type('sharedModel'))
      .then(() => cy.get(BUTTON_renameModelConfirm).click().wait(500))
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).should('be.disabled'))
      .then(() => cy.get(SELECTOR_tbGenerateDocumentButton).should('be.disabled'));
  });
});
