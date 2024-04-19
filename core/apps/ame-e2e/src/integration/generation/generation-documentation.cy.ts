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

import {GENERATION_tbDownloadDoc} from '../../support/constants';

describe('Test generation and download of Aspect Model documentation', () => {
  it('Can generate and download valid Aspect Model documentation', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.openGenerationDocumentation().wait(500))
      .then(() => cy.get(GENERATION_tbDownloadDoc).click({force: true}).wait(5000))
      .then(() => cy.fixture('cypress/downloads/AspectDefault-documentation.html'));
  });
});
