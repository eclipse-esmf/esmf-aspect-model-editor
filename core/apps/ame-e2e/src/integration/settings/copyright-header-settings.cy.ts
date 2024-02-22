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

import {SELECTOR_settingsButton, SettingsDialogSelectors} from '../../support/constants';

describe('Test language settings', () => {
  const copyrightField = '[data-cy=copyright]';

  it('can see copyright header', () => {
    cy.visitDefault();
    cy.startModelling();
    cy.get(SELECTOR_settingsButton)
      .click()
      .wait(1000)
      .then(() => cy.get(':nth-child(7) > .settings__node').click())
      .then(() => cy.get(copyrightField).should('exist').clear().should('have.value', ''));
  });

  it('can add copyright header', () => {
    cy.get(copyrightField)
      .type('CopyrightHeader')
      .then(() => {
        cy.get(SettingsDialogSelectors.settingsDialogOkButton).should('be.disabled');
        cy.get(SettingsDialogSelectors.settingsDialogApplyButton).should('be.disabled');
      })
      .then(() => cy.get(copyrightField).clear().type('# CopyrightHeader'))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogOkButton).click())
      .then(() => cy.get(SELECTOR_settingsButton).click())
      .then(() => cy.get(':nth-child(7) > .settings__node').click())
      .then(() => cy.get(copyrightField).should('have.value', '# CopyrightHeader'))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogCancelButton).click());
  });

  it.skip('check Aspect Model includes copyright header', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/format', req => {
      req.reply({
        statusCode: 200,
        body: req.body,
      });
    });
    cy.window()
      .then(win => {
        return new Cypress.Promise((resolve, reject) => {
          const fileHandlingService = win['angular.fileHandlingService'];
          fileHandlingService.copyToClipboard().subscribe({
            next: () => {
              win.navigator.clipboard.readText().then(text => {
                resolve(text);
              });
            },
            error: reject,
          });
        });
      })
      .then(text => {
        expect(text).to.contain('# CopyrightHeader');
      });
  });
});
