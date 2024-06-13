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
  GENERATION_accordionTitle,
  GENERATION_activateResourcePathCheckbox,
  GENERATION_removeUploadFile,
  GENERATION_resourcePathInput,
  GENERATION_resourcePathPatternError,
  GENERATION_resourcePathRequiredError,
  GENERATION_resourcePathTitle,
  GENERATION_tbBaseUrlInput,
  GENERATION_tbBaseUrlInputError,
  GENERATION_tbGenerateOpenApiButton,
  GENERATION_tbOutputButton,
  GENERATION_tbOutputButton_JSON,
  GENERATION_tbOutputButton_YAML,
  GENERATION_uploadContent,
  GENERATION_uploadContentFileInput,
  GENERATION_uploadFileRequireError,
  GENERATION_uploadTitle,
} from '../../support/constants';

describe('Test generation and download of open api specification', () => {
  it('Can generate valid JSON Open Api Specification', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationOpenApiSpec().wait(500))
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_JSON).click())
      .then(() => cy.get(GENERATION_tbBaseUrlInput).focus().clear().blur())
      .then(() =>
        cy.get(GENERATION_tbBaseUrlInputError).should('exist').should('be.visible').should('contain.text', 'Please add a valid url'),
      )
      .then(() => cy.get(GENERATION_tbBaseUrlInput).focus().type('https://example.com').blur())
      .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click({force: true}).wait(7000))
      .then(() => cy.fixture('cypress/downloads/en-open-api.json'));
  });

  it('Can generate valid JSON Open Api Specification with resource path', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationOpenApiSpec().wait(500))
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_JSON).click())
      .then(() => cy.get(GENERATION_resourcePathTitle).should('not.exist'))
      .then(() => cy.get(GENERATION_activateResourcePathCheckbox).click())
      .then(() =>
        cy
          .get(GENERATION_resourcePathTitle)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'Resource Path - The resource path for the Aspect API endpoints'),
      )
      .then(() => cy.get(GENERATION_resourcePathInput).should('exist').should('be.visible').focus().clear().blur())
      .then(() =>
        cy
          .get(GENERATION_resourcePathRequiredError)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'Resource path is required'),
      )
      .then(() => checkResourcePath())
      .then(() => cy.get(GENERATION_uploadTitle).should('exist').should('be.visible').should('contain.text', 'Upload JSON File'))
      .then(() => cy.get(GENERATION_uploadContent).should('exist').should('be.visible'))
      .then(() =>
        cy
          .get(GENERATION_uploadFileRequireError)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'JSON file is required - a variable has been defined in the resource path.'),
      )
      .then(() => cy.get(GENERATION_uploadContentFileInput).attachFile('valid-json.json'))
      .then(() => cy.get(GENERATION_uploadContent).should('not.exist'))
      .then(() => cy.get(GENERATION_accordionTitle).should('exist').should('be.visible').should('contain.text', 'Properties'))
      .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click().wait(5000))
      .then(() => cy.fixture('cypress/downloads/en-open-api.json'));
  });

  it('Can generate and download valid YAML Open Api Specification', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationOpenApiSpec().wait(500))
      .then(() => cy.get(GENERATION_tbOutputButton).click())
      .then(() => cy.get(GENERATION_tbOutputButton_YAML).click())
      .then(() => cy.get(GENERATION_tbBaseUrlInput).focus().clear().blur())
      .then(() =>
        cy.get(GENERATION_tbBaseUrlInputError).should('exist').should('be.visible').should('contain.text', 'Please add a valid url'),
      )
      .then(() => cy.get(GENERATION_tbBaseUrlInput).focus().type('https://example.com').blur())
      .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click({force: true}).wait(9000))
      .then(() => cy.fixture('cypress/downloads/en-open-api.yaml'));
  });

  it('Can generate valid YAML Open Api Specification with resource path', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationOpenApiSpec().wait(500))
      .then(() => cy.get(GENERATION_resourcePathTitle).should('not.exist'))
      .then(() => cy.get(GENERATION_activateResourcePathCheckbox).click())
      .then(() =>
        cy
          .get(GENERATION_resourcePathTitle)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'Resource Path - The resource path for the Aspect API endpoints'),
      )
      .then(() => cy.get(GENERATION_resourcePathInput).should('exist').should('be.visible').focus().clear().blur())
      .then(() =>
        cy
          .get(GENERATION_resourcePathRequiredError)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'Resource path is required'),
      )
      .then(() => checkResourcePath())
      .then(() => cy.get(GENERATION_uploadTitle).should('exist').should('be.visible').should('contain.text', 'Upload YAML File'))
      .then(() => cy.get(GENERATION_uploadContent).should('exist').should('be.visible'))
      .then(() =>
        cy
          .get(GENERATION_uploadFileRequireError)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'YAML file is required - a variable has been defined in the resource path.'),
      )
      .then(() => cy.get(GENERATION_uploadContentFileInput).attachFile('valid-yml.yml'))
      .then(() => cy.get(GENERATION_uploadContent).should('not.exist'))
      // .then(() => cy.get(GENERATION_accordionTitle).should('exist').should('be.visible').should('contain.text', 'properties'))
      // .then(() => cy.get(GENERATION_tbGenerateOpenApiButton).click().wait(5000))
      // .then(() => cy.fixture('cypress/downloads/en-open-api.yaml'));
  });

  it('Test some generate variations', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationOpenApiSpec().wait(500))
      .then(() => cy.get(GENERATION_resourcePathTitle).should('not.exist'))
      .then(() => {
        cy.get(GENERATION_activateResourcePathCheckbox).click();
        cy.get(GENERATION_resourcePathTitle)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'Resource Path - The resource path for the Aspect API endpoints');
        cy.get(GENERATION_resourcePathInput).should('exist').should('be.visible').scrollIntoView();
        cy.get(GENERATION_uploadTitle).should('exist').should('be.visible').should('contain.text', 'Upload YAML File');
        cy.get(GENERATION_uploadContent).should('exist').should('be.visible');
        cy.get(GENERATION_uploadFileRequireError)
          .should('exist')
          .should('be.visible')
          .should('contain.text', 'YAML file is required - a variable has been defined in the resource path.');
        cy.get(GENERATION_uploadContentFileInput).attachFile('valid-yml.yml');
        cy.get(GENERATION_uploadContent).should('not.exist');
        cy.get(GENERATION_accordionTitle).should('exist').should('be.visible').should('contain.text', 'Properties');
        cy.get(GENERATION_tbGenerateOpenApiButton).should('be.enabled');
      })
      .then(() => {
        cy.get(GENERATION_removeUploadFile).click({force: true});
        cy.get(GENERATION_uploadContent).should('exist').should('be.visible');
        cy.get(GENERATION_accordionTitle).should('not.exist');
      })
      .then(() => {
        cy.get(GENERATION_uploadContentFileInput).attachFile('valid-yml.yml');
        cy.get(GENERATION_tbOutputButton).click();
        cy.get(GENERATION_tbOutputButton_JSON).click();
        cy.get(GENERATION_uploadContent).should('exist').should('be.visible');
        cy.get(GENERATION_accordionTitle).should('not.exist');
      })
      .then(() => {
        cy.get(GENERATION_uploadContentFileInput).attachFile('valid-json.json');
        cy.get(GENERATION_uploadContent).should('not.exist');
        cy.get(GENERATION_accordionTitle).should('exist').should('be.visible');
        cy.get(GENERATION_tbGenerateOpenApiButton).should('be.enabled');
      })
      .then(() => {
        cy.get(GENERATION_activateResourcePathCheckbox).click();
        cy.get(GENERATION_uploadContent).should('not.exist');
        cy.get(GENERATION_accordionTitle).should('not.exist');
        cy.get(GENERATION_tbGenerateOpenApiButton).should('be.enabled');
      });
  });

  function checkResourcePath(): void {
    cy.get(GENERATION_resourcePathInput).focus().type('/').blur();
    cy.get(GENERATION_resourcePathPatternError).should('not.exist');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('//').blur();
    cy.get(GENERATION_resourcePathPatternError).should('exist').should('be.visible').should('contain.text', 'Pattern is not matching');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('resource').blur();
    cy.get(GENERATION_resourcePathPatternError).should('exist').should('be.visible').should('contain.text', 'Pattern is not matching');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('/resource').blur();
    cy.get(GENERATION_resourcePathPatternError).should('not.exist');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('/resource/{{').blur();
    cy.get(GENERATION_resourcePathPatternError).should('exist').should('be.visible').should('contain.text', 'Pattern is not matching');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('/resource/}}').blur();
    cy.get(GENERATION_resourcePathPatternError).should('exist').should('be.visible').should('contain.text', 'Pattern is not matching');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('/resource/{}').blur();
    cy.get(GENERATION_resourcePathPatternError).should('not.exist');
    cy.get(GENERATION_resourcePathInput).focus().clear().type('/resource/{resourceId}', {parseSpecialCharSequences: false}).blur();
    cy.get(GENERATION_resourcePathPatternError).should('not.exist');
  }
});
