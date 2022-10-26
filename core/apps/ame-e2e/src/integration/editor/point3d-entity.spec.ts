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

import {FIELD_extends, SELECTOR_editorSaveButton, SELECTOR_tbDeleteButton} from '../../support/constants';

describe('Time Series Entity', () => {
  function createPoint3dEntity() {
    return cy
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => cy.get(FIELD_extends).type('Point3d', {force: true}))
      .then(() => cy.get('[data-cy="Point3d"]').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}));
  }

  it('should create Point3d with its properties', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => createPoint3dEntity())

      .then(() => cy.clickShape('Entity1'))
      .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = Point 3D @en'))
      .then(() =>
        cy
          .getCellLabel('Entity1', 'description')
          .should('eq', 'Inherited\ndescription = Defines a position in a three dimensional space. @en')
      )

      .then(() => cy.clickShape('Point3d'))
      .then(() => cy.getCellLabel('Point3d', 'preferredName').should('eq', 'preferredName = Point 3D @en'))
      .then(() =>
        cy.getCellLabel('Point3d', 'description').should('eq', 'description = Defines a position in a three dimensional space. @en')
      )

      .then(() => cy.clickShape('[x]'))
      .then(() => cy.getCellLabel('[x]', 'extends').should('eq', 'extends = x'))
      .then(() => cy.getCellLabel('[x]', 'preferredName').should('eq', 'Inherited\npreferredName = X @en'))
      .then(() => cy.getCellLabel('[x]', 'description').should('eq', 'Inherited\ndescription = The position along the X axis @en'))

      .then(() => cy.clickShape('x'))
      .then(() => cy.getCellLabel('x', 'preferredName').should('eq', 'preferredName = X @en'))
      .then(() => cy.getCellLabel('x', 'description').should('eq', 'description = The position along the X axis @en'))

      .then(() => cy.clickShape('[y]'))
      .then(() => cy.getCellLabel('[y]', 'extends').should('eq', 'extends = y'))
      .then(() => cy.getCellLabel('[y]', 'preferredName').should('eq', 'Inherited\npreferredName = Y @en'))
      .then(() => cy.getCellLabel('[y]', 'description').should('eq', 'Inherited\ndescription = The position along the Y axis @en'))

      .then(() => cy.clickShape('y'))
      .then(() => cy.getCellLabel('y', 'preferredName').should('eq', 'preferredName = Y @en'))
      .then(() => cy.getCellLabel('y', 'description').should('eq', 'description = The position along the Y axis @en'))

      .then(() => cy.clickShape('[z]'))
      .then(() => cy.getCellLabel('[z]', 'extends').should('eq', 'extends = z'))
      .then(() => cy.getCellLabel('[z]', 'preferredName').should('eq', 'Inherited\npreferredName = Z @en'))
      .then(() => cy.getCellLabel('[z]', 'description').should('eq', 'Inherited\ndescription = The position along the Z axis @en'))

      .then(() => cy.clickShape('z'))
      .then(() => cy.getCellLabel('z', 'preferredName').should('eq', 'preferredName = Z @en'))
      .then(() => cy.getCellLabel('z', 'description').should('eq', 'description = The position along the Z axis @en'));
  });

  it('should remove Point3d tree by removing Point3d', () => {
    cy.clickShape('Point3d')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="Point3d"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="x"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="y"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="z"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[x]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[y]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[z]"]').should('not.exist'));
  });

  it('should remove Point3d tree by removing x', () => {
    createPoint3dEntity();

    cy.clickShape('x')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="Point3d"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="x"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="y"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="z"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[x]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[y]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[z]"]').should('not.exist'));
  });

  it('should remove Point3d tree by removing y', () => {
    createPoint3dEntity();

    cy.clickShape('y')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="Point3d"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="x"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="y"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="z"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[x]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[y]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[z]"]').should('not.exist'));
  });

  it('should remove Point3d tree by removing z', () => {
    createPoint3dEntity();

    cy.clickShape('z')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="Point3d"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="x"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="y"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="z"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[x]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[y]"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="[z]"]').should('not.exist'));
  });
});
