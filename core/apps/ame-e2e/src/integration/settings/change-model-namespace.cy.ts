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
import {NAMESPACES_URL} from '../../support/api-mocks';

import 'cypress-real-events';
import {
  ACTION_dialogButton,
  FIELD_name,
  SELECTOR_namespaceTabValueInput,
  SELECTOR_namespaceTabVersionInput,
  SELECTOR_settingsButton,
  SELECTOR_workspaceBtn,
  SettingsDialogSelectors,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test namespace settings dialog', () => {
  describe('Test changing model namespace version', () => {
    it('should open namespace settings', () => {
      cy.visitDefault();
      cy.startModelling();
      openNamespaceSettings().then(() => verifyNamespaceSettings('org.eclipse.examples.aspect', '1.0.0'));
    });

    it('change namespace and version on settings', () => {
      changeNamespaceSettings('org.eclipse.examples.test', '2.0.0')
        .then(() => openNamespaceSettings())
        .then(() => verifyNamespaceSettings('org.eclipse.examples.test', '2.0.0'))
        .then(() => cy.get(SettingsDialogSelectors.settingsDialogCancelButton).click());
    });
  });

  // Skip this test until further fixing
  describe.skip('Test changing model namespace version', () => {
    it('should change namespace and version and save aspect model', () => {
      cy.intercept('GET', NAMESPACES_URL, {statusCode: 200, body: {}});

      cy.visitDefault();
      cy.fixture('/change-namespace/aspect-workspace-one')
        .as('rdfString')
        .then(rdfString => cy.loadModel(rdfString));

      cy.intercept('GET', NAMESPACES_URL, {
        statusCode: 200,
        body: {
          'org.eclipse.examples.one': [
            {
              version: '1.0.0',
              models: [
                {
                  model: 'aspect-workspace-one.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.one:1.0.0#AspectDefault',
                  existing: true,
                },
              ],
            },
          ],
        },
      });

      cy.intercept(
        {
          method: 'GET',
          url: 'http://localhost:9090/ame/api/models',
          headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.examples.one:1.0.0#AspectDefault'},
        },
        {
          fixture: '/change-namespace/aspect-workspace-one.ttl',
        },
      );

      cy.saveAspectModelToWorkspace().then(() => cy.get(SELECTOR_workspaceBtn).click());

      cy.intercept('GET', NAMESPACES_URL, {
        statusCode: 200,
        body: {
          'org.eclipse.examples.one': [
            {
              version: '1.0.0',
              models: [
                {
                  model: 'aspect-workspace-one.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.one:1.0.0#AspectDefault',
                  existing: true,
                },
              ],
            },
          ],
          'org.eclipse.examples.two': [
            {
              version: '2.0.0',
              models: [
                {
                  model: 'aspect-workspace-two.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.two:2.0.0#AspectDefault',
                  existing: true,
                },
              ],
            },
          ],
        },
      });

      cy.intercept(
        {
          method: 'GET',
          url: 'http://localhost:9090/ame/api/models',
          headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.examples.two:2.0.0#AspectDefault'},
        },
        {
          fixture: '/change-namespace/aspect-workspace-two.ttl',
        },
      );

      openNamespaceSettings()
        .then(() => changeNamespaceSettings('org.eclipse.examples.two', '2.0.0'))
        .then(() => cy.saveAspectModelToWorkspace())
        .then(() => cy.get(ACTION_dialogButton).click())
        .then(() => openNamespaceSettings())
        .then(() => verifyNamespaceSettings('org.eclipse.examples.two', '2.0.0'))
        .then(() => cy.get(SettingsDialogSelectors.settingsDialogCancelButton).click())
        .then(() => cy.get('.namespaces').invoke('html'))
        .then(html => {
          expect(html).contain('org.eclipse.examples.two:2.0.0');
          expect((html.match(/AspectDefault.ttl/g) || []).length).to.equal(2);
        })
        .then(() => cy.get('[ng-reflect-message="This file is currently opened "]').invoke('html'))
        .then(html => expect(html).contain('AspectDefault.ttl'));
    });

    it('should change name of aspect element and save to workspace', () => {
      cy.intercept('GET', NAMESPACES_URL, {
        statusCode: 200,
        body: {
          'org.eclipse.examples.one': [
            {
              version: '1.0.0',
              models: [
                {
                  model: 'aspect-workspace-one.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.one:1.0.0#AspectDefault',
                  existing: true,
                },
              ],
            },
          ],
          'org.eclipse.examples.two': [
            {
              version: '2.0.0',
              models: [
                {
                  model: 'aspect-workspace-two.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.two:2.0.0#AspectDefault',
                  existing: true,
                },
                {
                  model: 'aspect-workspace-three.ttl',
                  aspectModelUrn: 'urn:samm:org.eclipse.examples.two:2.0.0#NewName',
                  existing: true,
                },
              ],
            },
          ],
        },
      });

      cy.intercept(
        {
          method: 'GET',
          url: 'http://localhost:9090/ame/api/models',
          headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.examples.one:1.0.0#AspectDefault'},
        },
        {
          fixture: '/change-namespace/aspect-workspace-one.ttl',
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: 'http://localhost:9090/ame/api/models',
          headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.examples.two:2.0.0#AspectDefault'},
        },
        {
          fixture: '/change-namespace/aspect-workspace-two.ttl',
        },
      );

      cy.intercept(
        {
          method: 'GET',
          url: 'http://localhost:9090/ame/api/models',
          headers: {'Aspect-Model-Urn': 'urn:samm:org.eclipse.examples.two:2.0.0#NewName'},
        },
        {
          fixture: '/change-namespace/aspect-workspace-three.ttl',
        },
      );

      cy.dbClickShape('AspectDefault')
        .then(() => cy.get(FIELD_name).clear({force: true}).type('NewName'))
        .then(() => cyHelp.clickSaveButton())
        .then(() => cy.saveAspectModelToWorkspace())
        .then(() => openNamespaceSettings())
        .then(() => verifyNamespaceSettings('org.eclipse.examples.two', '2.0.0'))
        .then(() => cy.get(SettingsDialogSelectors.settingsDialogCancelButton).click())
        .then(() => cy.get('.namespaces').invoke('html'))
        .then(html => {
          expect(html).contain('org.eclipse.examples.two:2.0.0');
          expect((html.match(/AspectDefault.ttl/g) || []).length).to.equal(2);
        })
        .then(() => cy.get('[ng-reflect-message="This file is currently opened "]').invoke('html'))
        .then(html => expect(html).contain('NewName.ttl'));
    });
  });

  function openNamespaceSettings() {
    return cy.get(SELECTOR_settingsButton).click().wait(1000).get(':nth-child(6) > .settings__node').click();
  }

  function verifyNamespaceSettings(namespace: string, version: string): void {
    cy.get(SELECTOR_namespaceTabValueInput).should('have.value', namespace);
    cy.get(SELECTOR_namespaceTabVersionInput).should('have.value', version);
  }

  function changeNamespaceSettings(namespace: string, version: string) {
    return cy
      .get(SELECTOR_namespaceTabValueInput)
      .clear()
      .type(namespace)
      .then(() => cy.get(SELECTOR_namespaceTabVersionInput).clear().type(version))
      .then(() => cy.get(SettingsDialogSelectors.settingsDialogOkButton).click());
  }
});
