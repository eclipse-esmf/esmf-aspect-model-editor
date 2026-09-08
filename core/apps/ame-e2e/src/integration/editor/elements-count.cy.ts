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

describe('Elements count', () => {
  before(() => {
    cy.visitDefault();
  });

  describe('Movement model', () => {
    it('should display elements count for incoming & outgoing edges', () => {
      cy.fixture('/default-models/movement.txt')
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => {
          cy.dbClickShape('Movement');
          cy.contains('Incoming edges').should('not.exist');
          cy.contains('Outgoing edges (4)').should('exist');

          cy.dbClickShape('isMoving');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('position');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('speed');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('speedLimitWarning');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('Boolean');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (0)').should('exist');

          cy.dbClickShape('SpatialPositionCharacteristic');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('Speed');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('TrafficLight');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (0)').should('exist');

          cy.dbClickShape('SpatialPosition');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (3)').should('exist');

          cy.dbClickShape('kilometrePerHour');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (0)').should('exist');

          cy.dbClickShape('latitude');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('longitude');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('altitude');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('Coordinate');
          cy.contains('Incoming edges (2)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('MetresAboveMeanSeaLevel');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('degreeUnitOfAngle');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (0)').should('exist');

          cy.dbClickShape('metre');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (0)').should('exist');
        });
    });
  });

  describe('Enumeration instances model', () => {
    it('should display elements count for incoming & outgoing edges', () => {
      cy.fixture('/enumeration-instances.txt')
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => {
          cy.dbClickShape('EnumerationInstances');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('enumerationInstancesProperty1');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('enumerationInstancesCharacteristic1');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (4)').should('exist');

          cy.dbClickShape('enumerationInstancesEntity1');
          cy.contains('Incoming edges (4)').should('exist');
          cy.contains('Outgoing edges (0)').should('exist');

          cy.dbClickShape('enumerationInstancesInstance1');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('enumerationInstancesInstance2');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('enumerationInstancesInstance3');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');
        });
    });
  });
});
