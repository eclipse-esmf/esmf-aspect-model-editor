/* eslint-disable cypress/no-unnecessary-waiting */
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

import {cyHelp} from '../../support/helpers';
import {
  SELECTOR_dialogStartButton,
  SELECTOR_fileMenuFindElements,
  SELECTOR_namespaceFileMenuButton,
  SELECTOR_openNamespacesButton,
} from '../../support/constants';
import {setUpDynamicModellingInterceptors, setUpStaticModellingInterceptors} from '../../support/api-mocks';
import {awaitValidateModelRequest} from '../../support/api-mock-helpers';

describe('Elements count', () => {
  describe('Movement model', () => {
    it('should display elements count for incoming & outgoing edges', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
      cy.fixture('/default-models/movement.txt')
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => {
          cy.get(SELECTOR_dialogStartButton).click();

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

    it('should display elements count in sidebar', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
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
        movement: {
          name: 'org.eclipse.examples.movement:1.0.0',
          files: [
            {
              name: 'Movement.ttl',
              response: {fixture: '/default-models/movement.txt'},
            },
          ],
        },
      };

      setUpStaticModellingInterceptors();
      setUpDynamicModellingInterceptors(namespacesConfig);

      cy.visitDefault();
      cy.fixture(namespacesConfig.aspectDefault.files[0].response.fixture)
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => {
          cy.get(SELECTOR_dialogStartButton).click();
          return awaitValidateModelRequest(`:AspectDefault`);
        })
        .then(({body}) => {
          namespacesConfig.aspectDefault.files[0].response = body;
          setUpDynamicModellingInterceptors(namespacesConfig);
        })
        .then(() => cy.fixture(namespacesConfig.movement.files[0].response.fixture))
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => {
          cy.get(SELECTOR_dialogStartButton).click();
          return awaitValidateModelRequest(`:Movement`);
        })
        .then(({body}) => {
          namespacesConfig.movement.files[0].response = body;
          setUpDynamicModellingInterceptors(namespacesConfig);
        })
        .then(() => cy.startModelling())
        .then(() => {
          cy.get(SELECTOR_openNamespacesButton).click({force: true});
          cy.contains('Movement.ttl');
          cy.get(SELECTOR_namespaceFileMenuButton).eq(1).click({force: true});
          cy.get(SELECTOR_fileMenuFindElements).click({force: true});
          cy.contains('Properties (7)').should('exist');
          cy.contains('Characteristics (5)').should('exist');
          cy.contains('Entities (1)').should('exist');
        });
    });
  });

  describe('Enumeration instances model', () => {
    it('should display elements count for incoming & outgoing edges', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
      cy.visitDefault();
      cy.fixture('/enumeration-instances.txt')
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => {
          cy.get(SELECTOR_dialogStartButton).click();

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

    it('should display elements count in sidebar', () => {
      cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
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
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => {
          cy.get(SELECTOR_dialogStartButton).click();
          return awaitValidateModelRequest(`:AspectDefault`);
        })
        .then(({body}) => {
          namespacesConfig.aspectDefault.files[0].response = body;
          setUpDynamicModellingInterceptors(namespacesConfig);
        })
        .then(() => cy.fixture(namespacesConfig.enumerationInstances.files[0].response.fixture))
        .then(rdfString => cyHelp.loadCustomModel(rdfString))
        .then(() => {
          cy.get(SELECTOR_dialogStartButton).click();
          return awaitValidateModelRequest(`:EnumerationInstances`);
        })
        .then(({body}) => {
          namespacesConfig.enumerationInstances.files[0].response = body;
          setUpDynamicModellingInterceptors(namespacesConfig);
        })
        .then(() => cy.startModelling())
        .then(() => {
          cy.get(SELECTOR_openNamespacesButton).click({force: true});
          cy.contains('EnumerationInstances.ttl');
          cy.get(SELECTOR_namespaceFileMenuButton).eq(0).click({force: true});
          cy.get(SELECTOR_fileMenuFindElements).click({force: true});
          cy.contains('Properties (1)').should('exist');
          cy.contains('Characteristics (1)').should('exist');
          cy.contains('Entities (1)').should('exist');
        });
    });
  });
});
