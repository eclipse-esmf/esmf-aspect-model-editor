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

import {
  SELECTOR_notificationsBtn,
  SELECTOR_notificationsClearButton,
  SELECTOR_notificationsDialogCloseButton,
  SELECTOR_tbValidateButton,
} from '../../support/constants';

describe('Test validate Aspect and Notifications', () => {
  it('can validate valid default model manually via toolbar without errors', () => {
    cy.visitDefault();
    cy.startModelling();
    cy.get(SELECTOR_tbValidateButton).click({force: true});
    cy.get(SELECTOR_notificationsBtn).click({force: true});
    cy.get('.message-title').each($el => {
      expect($el.text()).not.to.contain('Mandatory property');
      expect($el.text()).not.to.contain('ERR_');
    });
    cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
  });

  it('shows validation notifications on invalid model and allows clearing them', () => {
    cy.visitDefault();
    cy.startModellingInvalidModel();
    cy.get(SELECTOR_tbValidateButton).click({force: true});
    cy.get(SELECTOR_notificationsBtn)
      .click({force: true})
      .then(() => {
        cy.contains('.message-title', 'Mandatory property samm:characteristic is missing on :property1.').should('be.visible');
      })
      .then(() => {
        cy.get(SELECTOR_notificationsClearButton).click({force: true});
      })
      .then(() => {
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      });
  });
});
