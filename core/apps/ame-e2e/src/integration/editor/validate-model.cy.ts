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

import {SELECTOR_notificationsButton, SELECTOR_notificationsDialogCloseButton, SELECTOR_tbValidateButton} from '../../support/constants';

describe('Test validate Aspect', () => {
  it('can validate default model', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'response-default-model-validation'}))
      .then(() => cy.get(SELECTOR_tbValidateButton).click({force: true}))
      .then(() => cy.get('.cdk-overlay-container').should('not.be.visible', 8000))
      .then(() => cy.get(SELECTOR_notificationsButton).click({force: true}))
      .then(() => {
        assert(cy.contains('.message-title', 'Error on element property1: A Property without a Characteristic has not been refined.'));
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      });
  });
});
