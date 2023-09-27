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

import Chainable = Cypress.Chainable;

export function awaitValidateModelRequest(toInclude: string): Chainable {
  return cy.wait(10000)
    .then(() => cy.wait('@validateModel', {timeout: 30000})
      .then(({request}) => {
        cy.wrap(request.body).should('include', toInclude);
        return cy.wrap(request);
      }));
}

export function awaitFormatModelRequest(toInclude: string): Chainable {
  return cy.wait('@formatModel').then(({request}) => {
    cy.wrap(request.body).should('include', toInclude);
    return cy.wrap(request);
  });
}
