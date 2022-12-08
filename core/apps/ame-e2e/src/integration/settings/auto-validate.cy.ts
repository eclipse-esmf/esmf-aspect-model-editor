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

import {SELECTOR_settingsButton, SettingsDialogSelectors, SNACK_BAR} from '../../support/constants';

describe('Auto Validate', () => {
  it('should open settings dialog', () => {
    cy.visitDefault()
      .then(() => cy.startModelling())
      .then(() => {
        cy.get(SELECTOR_settingsButton).click({force: true});
        cy.get(SettingsDialogSelectors.autoValidateInput).should('exist');
      });
  });

  it('should set timer to 2 seconds', () => {
    cy.get(SettingsDialogSelectors.autoValidateInput)
      .clear({force: true})
      .type('2', {force: true})
      .focused()
      .blur()
      .then(() => cy.get(SNACK_BAR).should('exist'));
  });

  it('should stop timer for validation', () => {
    cy.get(SettingsDialogSelectors.autoValidateInput)
      .clear({force: true})
      .type('10')
      .focused()
      .blur()
      .then(() => cy.get(SettingsDialogSelectors.autoValidateToggle).click({force: true}))
      .wait(6000)
      .then(() => cy.get(SNACK_BAR).should('not.exist'));
  });
});
