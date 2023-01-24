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

import {
  FIELD_name,
  SELECTOR_editorSaveButton,
  SELECTOR_notificationsButton,
  SELECTOR_notificationsDialogCloseButton,
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
          expect(rdf).to.contain(':NewAspect a bamm:Aspect');
          cy.clickShape('NewAspect');
          cy.getAspect().then((aspect: Aspect) => {
            expect(aspect.name).to.equal('NewAspect');
          });
        })
      );
  });

  it('can not delete existing', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.clickShape('NewAspect'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.getAspect().then((aspect: Aspect) => assert.isNotNull(aspect)))
      .then(() => cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('NewAspect')))
      .then(() => cy.get(SELECTOR_notificationsButton).click({force: true}))
      .then(() => {
        assert(cy.contains('.message-title', 'The Aspect can`t be deleted'));
        cy.get(SELECTOR_notificationsDialogCloseButton).click({force: true});
      });
  });

  it('can delete property1 and property3', () => {
    cy.shapeExists('NewAspect')
      .then(() => cy.clickShape('property1'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.clickShape('property3'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => {
        cy.getAspect().then((aspect: Aspect) => expect(aspect.properties).to.have.length(2));
        cy.getUpdatedRDF().then(rdf => expect(rdf).to.contain('bamm:properties (:property2 :property4)'));
      });
  });
});
