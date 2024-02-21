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

import {SELECTOR_notificationsBtn, SELECTOR_notificationsDialogCloseButton} from '../../support/constants';

describe('Test validate Aspect', () => {
  it('can validate default model', () => {
    cy.visitDefault();
    cy.wait(1000);
    cy.startModellingInvalidModel();
    cy.get(SELECTOR_notificationsBtn)
      .click()
      .then(() => {
        assert(cy.contains('.message-title', 'Mandatory property samm:characteristic is missing on :property1.'));
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      });
  });
});
