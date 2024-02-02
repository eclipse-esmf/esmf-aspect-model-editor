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
  SELECTOR_dialogInputModel,
  SELECTOR_dialogStartButton,
  SELECTOR_notificationsButton,
  SELECTOR_notificationsDialogCloseButton,
  SELECTOR_tbLoadButton,
  SELECTOR_tbValidateButton,
} from '../../support/constants';

describe('Test validate Aspect', () => {
  it('can validate default model', () => {
    cy.visitDefault();
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'response-default-model-validation.json'});
    cy.fixture('invalid-file')
      .as('rdfString')
      .then(rdfString => {
        cy.get(SELECTOR_tbLoadButton).click({force: true});
        cy.get('[data-cy="create-model"]').click({force: true});
        cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
      })
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
      .wait(2000)
      .then(() => cy.get(SELECTOR_tbValidateButton).click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000))
      .then(() => cy.get(SELECTOR_notificationsButton).click({force: true}))
      .then(() => {
        assert(cy.contains('.message-title', 'Mandatory property samm:characteristic is missing on :property1.'));
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      });
  });
});
