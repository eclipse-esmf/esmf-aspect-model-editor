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

import {FIELD_extends, SELECTOR_elementBtn, SELECTOR_tbDeleteButton} from '../../support/constants';
import {cyHelp} from '../../support/helpers';

describe('Time Series Entity', () => {
  function createTimeSeriesEntity() {
    return cy
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => cy.get(FIELD_extends).type('TimeSeriesEntity', {force: true}))
      .then(() => cy.get('[data-cy="TimeSeriesEntity"]').click({force: true}))
      .then(() => cyHelp.clickSaveButton());
  }

  it('should create TimeSeriesEntity with its properties', () => {
    cy.visitDefault();
    cy.startModelling()
      .wait(500)
      .then(() => cy.get(SELECTOR_elementBtn).click())
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => createTimeSeriesEntity())
      .then(() => cy.clickShape('Entity1'))
      .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Time Series Entity @en'))
      .then(() =>
        cy
          .getCellLabel('Entity1', 'description')
          .should(
            'eq',
            'Inherited\ndescription = An Entity which represents a key/value pair. The key is the timestamp when the value was recorded and the value is the value which was recorded. @en',
          ),
      )
      .then(() => cy.clickShape('TimeSeriesEntity'))
      .then(() => cy.getCellLabel('TimeSeriesEntity', 'preferredName').should('eq', 'preferredName = Time Series Entity @en'))
      .then(() =>
        cy
          .getCellLabel('TimeSeriesEntity', 'description')
          .should(
            'eq',
            'description = An Entity which represents a key/value pair. The key is the timestamp when the value was recorded and the value is the value which was recorded. @en',
          ),
      )
      .then(() => cy.clickShape('[value]'))
      .then(() => cy.getCellLabel('[value]', 'extends').should('eq', 'extends = value'))
      .then(() => cy.getCellLabel('[value]', 'preferredName').should('eq', 'Inherited\npreferredName = Value @en'))
      .then(() =>
        cy
          .getCellLabel('[value]', 'description')
          .should('eq', 'Inherited\ndescription = The value recorded at the given point in time @en'),
      )
      .then(() => cy.clickShape('value'))
      .then(() => cy.getCellLabel('value', 'preferredName').should('eq', 'preferredName = Value @en'))
      .then(() => cy.getCellLabel('value', 'description').should('eq', 'description = The value recorded at the given point in time @en'))
      .then(() => cy.clickShape('timestamp'))
      .then(() => cy.getCellLabel('timestamp', 'preferredName').should('eq', 'preferredName = Timestamp @en'))
      .then(() =>
        cy
          .getCellLabel('timestamp', 'description')
          .should('eq', 'description = The specific point in time when the corresponding value was recorded. @en'),
      )
      .then(() => cy.clickShape('Timestamp'))
      .then(() => cy.getCellLabel('Timestamp', 'preferredName').should('eq', 'preferredName = Timestamp @en'))
      .then(() => cy.getCellLabel('Timestamp', 'dataType').should('eq', 'dataType = dateTime'))
      .then(() =>
        cy
          .getCellLabel('Timestamp', 'description')
          .should('eq', 'description = Describes a Property which contains the date and time with an optional timezone. @en'),
      );
  });

  it('should remove TimeSeriesEntity tree by removing TimeSeriesEntity', () => {
    cy.clickShape('TimeSeriesEntity')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="TimeSeriesEntity"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="value"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[value]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="timestamp"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="Timestamp"]').should('not.exist'));
  });

  it('should remove TimeSeriesEntity tree by removing value', () => {
    createTimeSeriesEntity();

    cy.clickShape('value')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="TimeSeriesEntity"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="value"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[value]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="timestamp"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="Timestamp"]').should('not.exist'));
  });

  it('should remove TimeSeriesEntity tree by removing timestamp', () => {
    createTimeSeriesEntity();

    cy.clickShape('timestamp')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="TimeSeriesEntity"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="value"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[value]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="timestamp"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="Timestamp"]').should('not.exist'));
  });

  it('should remove TimeSeriesEntity tree by removing Timestamp', () => {
    createTimeSeriesEntity();

    cy.clickShape('Timestamp')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="TimeSeriesEntity"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="value"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[value]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="timestamp"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="Timestamp"]').should('not.exist'));
  });

  it('should export', () => {
    createTimeSeriesEntity();
    cy.then(() => cy.getUpdatedRDF()).then(rdf => {
      expect(rdf).to.contain(`[
  samm:characteristic :Characteristic6;
  samm:extends samm-e:value
]`);
      expect(rdf).to.contain(`samm:extends samm-e:TimeSeriesEntity`);
    });
  });

  it('should import', () => {
    cy.visitDefault();
    cy.startModelling();
    cy.fixture('time-series-entity')
      .as('rdfString')
      .then(rdfString => cy.loadModel(rdfString))
      .wait(500)
      .then(() => cy.clickShape('Entity1'))
      .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Time Series Entity @en'))
      .then(() =>
        cy
          .getCellLabel('Entity1', 'description')
          .should(
            'eq',
            'Inherited\ndescription = An Entity which represents a key/value pair. The key is the timestamp when the value was recorded and the value is the value which was recorded. @en',
          ),
      )

      .then(() => cy.clickShape('TimeSeriesEntity'))
      .then(() => cy.getCellLabel('TimeSeriesEntity', 'preferredName').should('eq', 'preferredName = Time Series Entity @en'))
      .then(() =>
        cy
          .getCellLabel('TimeSeriesEntity', 'description')
          .should(
            'eq',
            'description = An Entity which represents a key/value pair. The key is the timestamp when the value was recorded and the value is the value which was recorded. @en',
          ),
      )

      .then(() => cy.clickShape('[value]'))
      .then(() => cy.getCellLabel('[value]', 'extends').should('eq', 'extends = value'))
      .then(() => cy.getCellLabel('[value]', 'preferredName').should('eq', 'Inherited\npreferredName = Value @en'))
      .then(() =>
        cy
          .getCellLabel('[value]', 'description')
          .should('eq', 'Inherited\ndescription = The value recorded at the given point in time @en'),
      )

      .then(() => cy.clickShape('value'))
      .then(() => cy.getCellLabel('value', 'preferredName').should('eq', 'preferredName = Value @en'))
      .then(() => cy.getCellLabel('value', 'description').should('eq', 'description = The value recorded at the given point in time @en'))

      .then(() => cy.clickShape('timestamp'))
      .then(() => cy.getCellLabel('timestamp', 'preferredName').should('eq', 'preferredName = Timestamp @en'))
      .then(() =>
        cy
          .getCellLabel('timestamp', 'description')
          .should('eq', 'description = The specific point in time when the corresponding value was recorded. @en'),
      )

      .then(() => cy.clickShape('Timestamp'))
      .then(() => cy.getCellLabel('Timestamp', 'preferredName').should('eq', 'preferredName = Timestamp @en'))
      .then(() => cy.getCellLabel('Timestamp', 'dataType').should('eq', 'dataType = dateTime'))
      .then(() =>
        cy
          .getCellLabel('Timestamp', 'description')
          .should('eq', 'description = Describes a Property which contains the date and time with an optional timezone. @en'),
      );
  });
});
