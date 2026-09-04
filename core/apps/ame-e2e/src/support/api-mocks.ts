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

export interface InterceptorConfigNamespaces {
  [key: string]: InterceptorConfigNamespace;
}

interface InterceptorConfigNamespace {
  name: string;
  files: InterceptorConfigNamespaceFile[];
}

interface InterceptorConfigNamespaceFile {
  name: string;
  response: {
    fixture?: string;
  };
}

/**
 * API URLs for mocking backend endpoints in E2E tests.
 */
export const API_BASE_URL = 'http://localhost:9090/ame/api';
export const MODELS_API_URL = `${API_BASE_URL}/models`;
export const NAMESPACES_URL = `${API_BASE_URL}/models/namespaces*`;
export const VALIDATE_API_URL = `${API_BASE_URL}/models/validate`;
export const FORMAT_API_URL = `${API_BASE_URL}/models/format`;
export const CHECK_ELEMENT_API_URL = `${API_BASE_URL}/models/check-element*`;
export const MODELS_BATCH_API_URL = `${API_BASE_URL}/models/batch`;

/**
 * SAMM version number to be used in e2e tests.
 * Affects only "version" fields of models loaded via interceptors, doesn't impact actual functionality.
 * Should match the real SAMM version in the application.
 */
export const SAMM_VERSION_ACTUAL = '2.2.0';

export function setUpDefaultInterceptors(): void {
  cy.intercept('GET', CHECK_ELEMENT_API_URL, {statusCode: 200, body: false}).as('checkElement');
  cy.intercept('POST', VALIDATE_API_URL, {fixture: 'model-validation-response.json'}).as('validateModel');
  cy.intercept('POST', FORMAT_API_URL, {}).as('formatModel');
  cy.intercept('GET', MODELS_API_URL, {statusCode: 200, body: {content: '', sourceLocation: null}}).as('getModels');
  cy.intercept('POST', MODELS_API_URL, {});
  cy.intercept('POST', MODELS_BATCH_API_URL, {statusCode: 200, body: []}).as('batchModelsDefault');
  cy.intercept('DELETE', MODELS_API_URL, {});
  cy.intercept('GET', NAMESPACES_URL, {statusCode: 200, body: {}}).as('getNamespaces');
}

export function setUpStaticModellingInterceptors(): void {
  setUpDefaultInterceptors();
}

export function setUpDynamicModellingInterceptors(namespacesConfig: InterceptorConfigNamespaces): void {
  const values: InterceptorConfigNamespace[] = Object.values(namespacesConfig);

  // Set up namespaces structure to return
  cy.intercept(
    'GET',
    NAMESPACES_URL,
    values.reduce(
      (acc, value) => ({
        ...acc,
        [value.name]: value.files.map(f => f.name),
      }),
      {},
    ),
  ).as('getNamespacesDynamic');

  // Set up files content to return
  values.forEach(value => {
    value.files.forEach(file => {
      cy.intercept(
        {
          method: 'GET',
          url: MODELS_API_URL,
          headers: {namespace: value.name, 'file-name': file.name},
        },
        file.response,
      );
    });
  });
}
