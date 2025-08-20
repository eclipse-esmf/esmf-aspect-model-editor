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

import {setUpDynamicModellingInterceptors, setUpStaticModellingInterceptors} from '../../support/api-mocks';
import {SELECTOR_workspaceBtn} from '../../support/constants';

// TODO redo the setUpDynamicModellingInterceptors function
describe('Elements count', () => {
  describe('Movement model', () => {
    it('should display elements count for incoming & outgoing edges', () => {
      cy.intercept('http://localhost:9090/ame/api/models/namespaces', {statusCode: 200, body: {}});
      cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
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
          cy.contains('Outgoing edges').should('not.exist');

          cy.dbClickShape('SpatialPositionCharacteristic');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('Speed');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('TrafficLight');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges').should('not.exist');

          cy.dbClickShape('SpatialPosition');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (3)').should('exist');

          cy.dbClickShape('kilometrePerHour');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges').should('not.exist');

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
          cy.contains('Outgoing edges').should('not.exist');

          cy.dbClickShape('metre');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges').should('not.exist');
        });
    });

    // TODO check the models and create a valid namespaces response
    it.skip('should display elements count in sidebar', () => {
      cy.intercept('http://localhost:9090/ame/api/models/namespaces', {statusCode: 200, body: {}});
      cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      const namespacesConfig = {
        'org.eclipse.examples.aspect': {
          version: '1.0.0',
          models: [
            {
              model: 'AspectDefault.ttl',
              aspectModelUrn: 'org.eclipse.examples.aspect:1.0.0#AspectDefault',
              existing: true,
            },
          ],
        },
        'org.eclipse.examples.movement': {
          version: '1.0.0',
          models: [
            {
              model: 'Movement.ttl',
              aspectModelUrn: 'org.eclipse.examples.movement:1.0.0#Movement',
              existing: true,
            },
          ],
        },

        // aspectDefault: {
        //   name: 'org.eclipse.examples.aspect:1.0.0',
        //   files: [
        //     {
        //       name: 'AspectDefault.ttl',
        //       response: {fixture: '/default-models/aspect-default.txt'},
        //     },
        //   ],
        // },
        // movement: {
        //   name: 'org.eclipse.examples.movement:1.0.0',
        //   files: [
        //     {
        //       name: 'Movement.ttl',
        //       response: {fixture: '/default-models/movement.txt'},
        //     },
        //   ],
        // },
      };

      //   setUpStaticModellingInterceptors();
      //   setUpDynamicModellingInterceptors(namespacesConfig);

      //   cy.visitDefault();
      //   cy.fixture(namespacesConfig.aspectDefault.files[0].response.fixture)
      //     .then(rdfString => cy.loadModel(rdfString))
      //     .then(() => cy.fixture(namespacesConfig.movement.files[0].response.fixture))
      //     .then(rdfString => cy.loadModel(rdfString))
      //     .then(() => cy.startModelling())
      //     .then(() => {
      //       cy.get(SELECTOR_workspaceBtn).click({force: true});
      //       cy.contains('Movement.ttl').click({force: true});
      //       cy.contains('Properties (7)').should('exist');
      //       cy.contains('Characteristics (5)').should('exist');
      //       cy.contains('Entities (1)').should('exist');
      //     });
    });
  });

  describe('Enumeration instances model', () => {
    it.skip('should display elements count for incoming & outgoing edges', () => {
      cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
      cy.fixture('/enumeration-instances.txt')
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => {
          cy.dbClickShape('EnumerationInstances');
          cy.contains('Incoming edges').should('not.exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('enumerationInstancesProperty1');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (1)').should('exist');

          cy.dbClickShape('enumerationInstancesCharacteristic1');
          cy.contains('Incoming edges (1)').should('exist');
          cy.contains('Outgoing edges (4)').should('exist');

          cy.dbClickShape('enumerationInstancesEntity1');
          cy.contains('Incoming edges (4)').should('exist');
          cy.contains('Outgoing edges').should('not.exist');

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

    it.skip('should display elements count in sidebar', () => {
      cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      const namespacesConfig = {
        aspectDefault: {
          name: 'org.eclipse.examples.aspect:1.0.0',
          files: [
            {
              name: 'AspectDefault.ttl',
              response: {fixture: '/default-models/aspect-default.txt'},
            },
          ],
        },
        enumerationInstances: {
          name: 'org.eclipse.digitaltwin:1.0.0',
          files: [
            {
              name: 'EnumerationInstances.ttl',
              response: {fixture: '/enumeration-instances.txt'},
            },
          ],
        },
      };

      setUpStaticModellingInterceptors();
      setUpDynamicModellingInterceptors(namespacesConfig);

      cy.visitDefault();
      cy.fixture(namespacesConfig.aspectDefault.files[0].response.fixture)
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => cy.fixture(namespacesConfig.enumerationInstances.files[0].response.fixture))
        .then(rdfString => cy.loadModel(rdfString))
        .then(() => cy.startModelling())
        .then(() => {
          cy.get(SELECTOR_workspaceBtn).click({force: true});
          cy.contains('EnumerationInstances.ttl').click({force: true});
          cy.contains('Properties (1)').should('exist');
          cy.contains('Characteristics (1)').should('exist');
          cy.contains('Entities (1)').should('exist');
        });
    });
  });
});
