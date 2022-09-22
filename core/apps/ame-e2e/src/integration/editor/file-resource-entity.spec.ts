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
  function createFileResourceEntity() {
    return cy
      .then(() => cy.dbClickShape('Entity1'))
      .then(() => cy.get(FIELD_extends).type('FileResource', {force: true}))
      .then(() => cy.get('[data-cy="FileResource"]').click({force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).click({force: true}));
  }

  it('should create FileResource with its properties', () => {
    cy.visitDefault();
    cy.startModelling()
      .then(() => cy.clickAddShapePlusIcon('Characteristic1'))
      .then(() => createFileResourceEntity())

      .then(() => cy.clickShape('Entity1'))
      .then(() => cy.getCellLabel('Entity1', 'preferredName').should('eq', 'Inherited\npreferredName = File Resource @en'))
      .then(() =>
        cy
          .getCellLabel('Entity1', 'description')
          .should('eq', 'Inherited\ndescription = Describes a resource with a relative or absolute location and a MIME type. @en')
      )

      .then(() => cy.clickShape('FileResource'))
      .then(() => cy.getCellLabel('FileResource', 'preferredName').should('eq', 'preferredName = File Resource @en'))
      .then(() =>
        cy
          .getCellLabel('FileResource', 'description')
          .should('eq', 'description = Describes a resource with a relative or absolute location and a MIME type. @en')
      )

      .then(() => cy.clickShape('resource'))
      .then(() => cy.getCellLabel('resource', 'preferredName').should('eq', 'preferredName = Resource @en'))
      .then(() => cy.getCellLabel('resource', 'description').should('eq', 'description = The location of the resource @en'))

      .then(() => cy.clickShape('mimeType'))
      .then(() => cy.getCellLabel('mimeType', 'preferredName').should('eq', 'preferredName = MIME Type @en'))
      .then(() => cy.getCellLabel('mimeType', 'description').should('eq', 'description = The MIME type of the resource @en'))

      .then(() => cy.clickShape('ResourcePath'))
      .then(() => cy.getCellLabel('ResourcePath', 'preferredName').should('eq', 'preferredName = Resource Path @en'))
      .then(() => cy.getCellLabel('ResourcePath', 'description').should('eq', 'description = The path of a resource. @en'))

      .then(() => cy.clickShape('MimeType'))
      .then(() => cy.getCellLabel('MimeType', 'preferredName').should('eq', 'preferredName = MIME Type @en'))
      .then(() =>
        cy
          .getCellLabel('MimeType', 'description')
          .should('eq', 'description = A MIME type as defined in RFC 2046, for example "application/pdf. @en')
      );
  });

  it('should remove FileResource tree by removing FileResource', () => {
    cy.clickShape('FileResource')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="FileResource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="resource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="mimeType"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="ResourcePath"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="MimeType"]').should('not.exist'));
  });

  it('should remove FileResource tree by removing resource', () => {
    createFileResourceEntity();

    cy.clickShape('resource')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="FileResource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="resource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="mimeType"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="ResourcePath"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="MimeType"]').should('not.exist'));
  });

  it('should remove FileResource tree by removing mimeType', () => {
    createFileResourceEntity();

    cy.clickShape('mimeType')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="FileResource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="resource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="mimeType"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="ResourcePath"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="MimeType"]').should('not.exist'));
  });

  it('should remove FileResource tree by removing ResourcePath', () => {
    createFileResourceEntity();

    cy.clickShape('ResourcePath')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="FileResource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="resource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="mimeType"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="ResourcePath"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="MimeType"]').should('not.exist'));
  });

  it('should remove FileResource tree by removing MimeType', () => {
    createFileResourceEntity();

    cy.clickShape('MimeType')
      .then(() => cy.get(SELECTOR_tbDeleteButton).click({force: true}))
      .then(() => cy.get('[data-cell-id="FileResource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="resource"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="mimeType"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="ResourcePath"]').should('not.exist'))
      .then(() => cy.get('[data-cell-id="MimeType"]').should('not.exist'));
  });
});
