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

import {Aspect} from '@ame/meta-model';
import {
  FIELD_name,
  SELECTOR_dialogInputModel,
  SELECTOR_dialogStartButton,
  SELECTOR_ecEvent,
  SELECTOR_editorSaveButton,
  SELECTOR_tbDeleteButton,
  SELECTOR_tbLoadButton,
} from '../../support/constants';

describe('Test edit Events', () => {
  it('can load events', () => {
    cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.visitDefault();
    cy.fixture('model-with-events')
      .as('rdfString')
      .then(rdfString => {
        cy.get(SELECTOR_tbLoadButton).click({force: true});
        cy.get('[data-cy="create-model"]').click({force: true});
        cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
      })
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}))
      .then(() => {
        cy.shapeExists('Seats').then(() => {
          cy.getAspect().then(aspect => {
            expect(aspect.name).to.equal('Seats');
            expect(aspect.events).to.have.lengthOf(2);
            expect(aspect.events[0].name).to.equal('SeatMoving');
            expect(aspect.events[1].name).to.equal('PassengerPresent');
            expect(aspect.events[0].parameters).to.have.lengthOf(4);
            expect(aspect.events[1].parameters).to.have.lengthOf(3);
            expect(aspect.events[0].parameters[0].property.name).to.equal('status');
            expect(aspect.events[0].parameters[1].property.name).to.equal('row');
            expect(aspect.events[0].parameters[2].property.name).to.equal('index');
            expect(aspect.events[0].parameters[3].property.name).to.equal('component');
            expect(aspect.events[1].parameters[0].property.name).to.equal('status');
            expect(aspect.events[1].parameters[1].property.name).to.equal('row');
            expect(aspect.events[1].parameters[2].property.name).to.equal('index');
          });
        });
      });
  });

  it('can add parameters', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.shapeExists('AspectDefault'))
      .then(() => cy.dragElement(SELECTOR_ecEvent, 100, 300))
      .then(() => cy.clickConnectShapes('AspectDefault', 'event1'))
      .then(() => cy.clickAddShapePlusIcon('event1'))
      .then(() => cy.clickAddShapePlusIcon('event1'))
      .then(() => cy.shapesConnected('event1', 'property2'))
      .then(() => cy.shapesConnected('event1', 'property3'))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.events[0].name).to.equal('event1');
          expect(aspect.events[0].parameters[0].property.name).to.equal('property2');
          expect(aspect.events[0].parameters[1].property.name).to.equal('property3');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:events (:event1)');
          expect(rdf).to.contain(':event1 a bamm:Event');
          expect(rdf).to.contain('bamm:parameters (:property2 :property3)');
          expect(rdf).to.contain(':property2 a bamm:Property');
          expect(rdf).to.contain(':property3 a bamm:Property');
        })
      );
  });

  it('can edit name', () => {
    cy.shapeExists('event1')
      .then(() => cy.dbClickShape('event1'))
      .then(() => cy.get(FIELD_name).clear({force: true}).type('newEvent', {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.events[0].name).to.equal('newEvent');
          expect(aspect.events[0].parameters).to.have.length(2);
          expect(aspect.events[0].parameters[0].property.name).to.equal('property2');
          expect(aspect.events[0].parameters[1].property.name).to.equal('property3');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:events (:newEvent)');
          expect(rdf).to.contain(':newEvent a bamm:Event');
          expect(rdf).to.contain('bamm:parameters (:property2 :property3)');
          expect(rdf).to.contain(':property2 a bamm:Property');
          expect(rdf).to.contain(':property3 a bamm:Property');
        })
      );
  });

  it('can delete parameter', () => {
    cy.shapeExists('newEvent')
      .then(() => cy.clickShape('property2'))
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() =>
        cy.getAspect().then((aspect: Aspect) => {
          expect(aspect.name).to.equal('AspectDefault');
          expect(aspect.events[0].name).to.equal('newEvent');
          expect(aspect.events[0].parameters).to.have.length(1);
          expect(aspect.events[0].parameters[0].property.name).to.equal('property3');
        })
      )
      .then(() =>
        cy.getUpdatedRDF().then(rdf => {
          expect(rdf).to.contain(':AspectDefault a bamm:Aspect');
          expect(rdf).to.contain('bamm:events (:newEvent)');
          expect(rdf).to.contain(':newEvent a bamm:Event');
          expect(rdf).to.contain('bamm:parameters (:property3)');
          expect(rdf).not.contain(':property2 a bamm:Property');
          expect(rdf).to.contain(':property3 a bamm:Property');
        })
      );
  });
});
