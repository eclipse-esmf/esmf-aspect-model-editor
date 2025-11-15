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

/// <reference types="cypress" />

import {SELECTOR_settingsButton, SettingsDialogSelectors} from '../../support/constants';

describe('Auto Validate', () => {
  it('should open editor settings dialog', () => {
    cy.visitDefault()
      .then(() => cy.startModelling())
      .then(() => {
        cy.get(SELECTOR_settingsButton).click({force: true});
        cy.get(SettingsDialogSelectors.autoValidateInput).should('exist');
      });
  });

  it('should set timer to 60 seconds', () => {
    cy.get(SettingsDialogSelectors.autoValidateInput)
      .clear({force: true})
      .type('60', {force: true})
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogOkButton).click())
      .then(() => cy.get(SELECTOR_settingsButton).click({force: true}))
      .then(() => cy.get(SettingsDialogSelectors.autoValidateInput).should('have.value', '60'))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogOkButton).click());
  });
});
