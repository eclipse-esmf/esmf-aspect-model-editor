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
 * URL pattern for intercepting "namespaces" requests.
 */
export const NAMESPACES_URL = 'http://localhost:9090/ame/api/models/namespaces*';
/**
 * SAMM version number to be used in e2e tests.
 * Affects only "version" fields of models loaded via interceptors, doesn't impact actual functionality.
 * Should match the real SAMM version in the application.
 */
export const SAMM_VERSION_ACTUAL = '2.2.0';

export function setUpStaticModellingInterceptors(): void {
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'}).as('validateModel');
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/format', {}).as('formatModel');
  cy.intercept('POST', 'http://localhost:9090/ame/api/models', {});
  cy.intercept('DELETE', 'http://localhost:9090/ame/api/models', {});
}

export function setUpDynamicModellingInterceptors(namespacesConfig: InterceptorConfigNamespaces): void {
  const values: any[] = Object.values(namespacesConfig);

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
  );

  // Set up files content to return
  values.forEach(value => {
    value.files.forEach(file => {
      console.warn('file', file);
      cy.intercept(
        {
          method: 'GET',
          url: 'http://localhost:9090/ame/api/models',
          headers: {namespace: value.name, 'file-name': file.name},
        },
        file.response,
      );
    });
  });
}
