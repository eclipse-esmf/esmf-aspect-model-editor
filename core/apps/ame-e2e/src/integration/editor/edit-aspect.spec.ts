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
  BUTTON_renameModelConfirm,
  FIELD_name,
  FIELD_renameModelInput,
  SELECTOR_editorSaveButton,
  SELECTOR_tbDeleteButton,
} from '../../support/constants';
import {cyHelp} from '../../support/helpers';
import {Aspect} from '@ame/meta-model';

describe('Test editing Aspect', () => {
  it('can add new', () => {
    cy.visitDefault();
    cy.startModelling();
  });

  it('can add properties', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cyHelp.addNewProperty(2))
      .then(() => cyHelp.addNewProperty(3))
      .then(() => cyHelp.addNewProperty(4));
  });

  it('can edit name', () => {
    cy.shapeExists('AspectDefault')
      .then(() => cy.dbClickShape('AspectDefault'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('NewAspect', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':NewAspect');
          expect(rdf).to.contain(':NewAspect a samm:Aspect');
        })
      );
  });

  it('can delete property1 and property3', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.clickShape('property1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.clickShape('property3'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('samm:properties (:property2 :property4)')));
  });

  it('can delete existing aspect', () => {
    cy.intercept('GET', 'http://localhost:9091/ame/api/models/namespaces?shouldRefresh=true', {
      'org.eclipse.different:1.0.0': ['external-property-reference.txt'],
    });
    cy.shapeExists('NewAspect')
      .then(() => cy.clickShape('NewAspect'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get(FIELD_renameModelInput).type('sharedModel'))
      .then(() => cy.get(BUTTON_renameModelConfirm).click().wait(500))
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).not.to.contain('NewAspect')));
  });
});
