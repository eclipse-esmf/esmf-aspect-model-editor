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

import {GENERATION_tbOutputButton, GENERATION_tbOutputButton_XML} from '../../support/constants';

describe('Test generation and download of AASX and XML specifications', () => {
  beforeEach(() => {
    cy.visitDefault();
    cy.startModelling();
  });

  it('Can generate valid AASX package', () => {
    cy.openGenerationAASX()
      .then(() => cy.get(GENERATION_tbOutputButton).should('be.visible'))
      .then(() => cy.get('button[color="primary"]').contains('Generate').click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault.aasx'));
  });

  it('Can generate valid XML AAS specification', () => {
    cy.openGenerationAASX()
      .then(() => cy.get(GENERATION_tbOutputButton).click({force: true}))
      .then(() => cy.get(GENERATION_tbOutputButton_XML).click({force: true}))
      .then(() => cy.get('button[color="primary"]').contains('Generate').click({force: true}))
      .then(() => cy.readFile('apps/ame-e2e/cypress/downloads/AspectDefault-aas.xml'));
  });
});
