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

import {SELECTOR_ecCharacteristic} from '../../../support/constants';
import {checkAspect, connectElements, setupAndDragExternalReference} from '../../../support/utils';

describe('Test drag and drop ext characteristic', () => {
  before(() => {
    cy.visitDefault();
  });

  it('can add Characteristic from external reference with different namespace', () => {
    setupAndDragExternalReference({
      fileName: 'external-characteristic-reference.ttl',
      elementName: 'ExternalCharacteristic',
      elementSelector: SELECTOR_ecCharacteristic,
      isSameNamespace: false,
      searchTerm: 'characteristic',
      x: 100,
      y: 300,
    })
      .then(() => connectElements('property1', 'ExternalCharacteristic', false))
      .then(() => cy.getAspect())
      .then(checkAspect)
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>.');
        expect(rdf).to.contain('@prefix ext-different: <urn:samm:org.eclipse.different:1.0.0#>.');
        expect(rdf).to.contain('samm:properties (:property1)');
        expect(rdf).to.contain(':property1 a samm:Property');
        expect(rdf).to.contain('samm:characteristic ext-different:ExternalCharacteristic');
        expect(rdf).not.contain(':ExternalCharacteristic a samm:Characteristic');
      });
  });
});
