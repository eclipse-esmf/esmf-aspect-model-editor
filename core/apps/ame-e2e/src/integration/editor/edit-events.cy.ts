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

import {FIELD_name, SELECTOR_ecEvent, SELECTOR_elementBtn, SELECTOR_tbDeleteButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Test edit Events', () => {
  it('can load events', () => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9090/ame/api/models/namespaces', {
      statusCode: 200,
      body: {},
    });
    cy.visitDefault();
    cy.fixture('model-with-events')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .then(() => {
        cy.shapeExists('Seats').then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.name).to.equal('Seats');
            expect(aspect.events).to.have.lengthOf(2);
            expect(aspect.events[0].name).to.equal('SeatMoving');
            expect(aspect.events[1].name).to.equal('PassengerPresent');
            expect(aspect.events[0].properties).to.have.lengthOf(4);
            expect(aspect.events[1].properties).to.have.lengthOf(3);
            expect(aspect.events[0].properties[0].name).to.equal('status');
            expect(aspect.events[0].properties[1].name).to.equal('row');
            expect(aspect.events[0].properties[2].name).to.equal('index');
            expect(aspect.events[0].properties[3].name).to.equal('component');
            expect(aspect.events[1].properties[0].name).to.equal('status');
            expect(aspect.events[1].properties[1].name).to.equal('row');
            expect(aspect.events[1].properties[2].name).to.equal('index');
          });
        });
      });
  });

  it('can add properties', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.shapeExists('AspectDefault'))
      .then(() => cy.dragElement(SELECTOR_ecEvent, 100, 300))
      .then(() => cy.clickConnectShapes('AspectDefault', 'event1'))
      .then(() => cy.clickAddShapePlusIcon('event1'))
      .then(() => cy.clickAddShapePlusIcon('event1'))
      .then(() => cy.shapesConnected('event1', 'property2'))
      .then(() => cy.shapesConnected('event1', 'property3'))
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.events[0].name).to.equal('event1');
          expect(aspect.events[0].properties[0].name).to.equal('property2');
          expect(aspect.events[0].properties[1].name).to.equal('property3');
        }),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a samm:Aspect');
          expect(rdf).to.contain('samm:events (:event1)');
          expect(rdf).to.contain(':event1 a samm:Event');
          expect(rdf).to.contain('samm:parameters (:property2 :property3)');
          expect(rdf).to.contain(':property2 a samm:Property');
          expect(rdf).to.contain(':property3 a samm:Property');
        }),
      );
  });

  it('can edit name', () => {
    cy.shapeExists('event1')
      .then(() => cy.dbClickShape('event1'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('newEvent', {force: true}))
      .then(() => cyHelp.clickSaveButton())
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.events[0].name).to.equal('newEvent');
          expect(aspect.events[0].properties).to.have.length(2);
          expect(aspect.events[0].properties[0].name).to.equal('property2');
          expect(aspect.events[0].properties[1].name).to.equal('property3');
        }),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a samm:Aspect');
          expect(rdf).to.contain('samm:events (:newEvent)');
          expect(rdf).to.contain(':newEvent a samm:Event');
          expect(rdf).to.contain('samm:parameters (:property2 :property3)');
          expect(rdf).to.contain(':property2 a samm:Property');
          expect(rdf).to.contain(':property3 a samm:Property');
        }),
      );
  });

  it('can delete parameter', () => {
    cy.shapeExists('newEvent')
      .then(() => cy.clickShape('property2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() =>
        cy.getAspect().then(aspect => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.events[0].name).to.equal('newEvent');
          expect(aspect.events[0].properties).to.have.length(1);
          expect(aspect.events[0].properties[0].name).to.equal('property3');
        }),
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a samm:Aspect');
          expect(rdf).to.contain('samm:events (:newEvent)');
          expect(rdf).to.contain(':newEvent a samm:Event');
          expect(rdf).to.contain('samm:parameters (:property3)');
          expect(rdf).not.contain(':property2 a samm:Property');
          expect(rdf).to.contain(':property3 a samm:Property');
        }),
      );
  });
});
