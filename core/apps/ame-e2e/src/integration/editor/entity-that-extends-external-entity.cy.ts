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
  SELECTOR_notificationsBtn,
  SELECTOR_notificationsDialogCloseButton,
} from '../../support/constants';


describe('Test loading aspect with extended external Entity', () => {
  it('should display an error that external reference that is not included in the namespace file structure', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('/external-reference/same-namespace/model-with-extended-entity.txt')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => {
        cy.get(SELECTOR_notificationsBtn).click({force: true})
        .then(() => cy.wait(500).get('.mat-mdc-cell').contains(' The Aspect model contains an external reference that is not included in the namespace file structure or is invalid').should('exist'))
        .then(() => cy.wait(500).get(SELECTOR_notificationsDialogCloseButton).click({force: true}))
      });
  });
});
