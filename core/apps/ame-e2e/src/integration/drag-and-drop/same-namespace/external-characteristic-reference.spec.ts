/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  SELECTOR_ecCharacteristic,
  SELECTOR_fileMenuFindElements,
  SELECTOR_namespaceFileMenuButton,
  SELECTOR_openNamespacesButton,
} from '../../../support/constants';
import {checkAspect, connectElements} from "../utils";

describe('Test drag and drop ext characteristic', () => {
  it('can add Characteristic from external reference with same namespace', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.examples:1.0.0': ['external-characteristic-reference.txt'],
    });

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/ame/api/models',
        headers: {
          namespace: 'org.eclipse.examples:1.0.0',
          'file-name': 'external-characteristic-reference.txt',
        },
      },
      {
        fixture: '/external-reference/same-namespace/without-childrens/external-characteristic-reference.txt',
      }
    );

    cy.visitDefault().then(() =>
      cy
        .startModelling()
        .then(() => cy.get(SELECTOR_openNamespacesButton).click({force: true}))
        .then(() => cy.get(SELECTOR_namespaceFileMenuButton).click({force: true}))
        .then(() => cy.get(SELECTOR_fileMenuFindElements).click({force: true}))
        .then(() => cy.dragElement(SELECTOR_ecCharacteristic, 100, 300))
        .then(() => cy.clickShape('ExternalCharacteristic'))
        .then(() => connectElements('property1', 'ExternalCharacteristic', false))
        .then(() => cy.getAspect())
        .then(checkAspect)
        .then(() => cy.getUpdatedRDF())
        .then(rdf => {
          expect(rdf).to.contain('samm:properties (:property1)');
          expect(rdf).to.contain(':property1 a samm:Property');
          expect(rdf).to.contain('samm:characteristic :ExternalCharacteristic');
          expect(rdf).not.contain(':ExternalCharacteristic a samm:Characteristic');
        })
    );
  });
});
