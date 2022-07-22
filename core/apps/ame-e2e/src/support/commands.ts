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

/// <reference types="cypress" />

import {MxGraphAttributeService} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {mxgraphFactory} from 'mxgraph-factory';
import {
  SELECTOR_dialogDefaultAspectButton,
  SELECTOR_dialogStartButton,
  SELECTOR_editorSaveButton,
  SELECTOR_modalsDropdown,
  SELECTOR_tbConnectButton,
  SELECTOR_tbLoadButton,
} from './constants';
import {cyHelp} from './helpers';

const {mxEventObject, mxEvent} = mxgraphFactory({});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Start modelling by creating a default model
       */
      startModelling(): Chainable;

      /**
       * Get the current aspect model
       */
      getAspect(): Chainable;

      getEditorService(): Chainable;

      getModelService(): Chainable;

      getMxgraphService(): Chainable;

      getMxgraphAttributeService(): Chainable;

      /**
       * Gets the html label containing all information about cell
       *
       * @param name cell name
       */
      getHTMLCell(name: string): Chainable;

      /**
       *
       * Double clicks cell to open editor.
       *
       * @param name  internal name of the element
       * @param labelName  label name present in the DOM
       */
      dbClickShape(name: string, labelName?: string): Chainable;

      /**
       * Drag and drop element
       *
       * @param selector element selector
       * @param x target drop position
       * @param y target drop position
       */
      dragElement(selector: string, x: number, y: number): Chainable;

      /**
       * Click cell to select it
       *
       * @param name name of the shape
       */
      clickShape(name: string): Chainable;

      /**
       * Create a new shape by clicking the plus icon
       *
       * @param name name of the shape to click the icon
       */
      clickAddShapePlusIcon(name: string): Chainable;

      /**
       * Create a new input property by clicking the left icon
       *
       * @param name name of the shape to click the icon
       */
      clickAddInputShapeIcon(name: string): Chainable;

      /**
       * Create a new output property by clicking the right icon
       *
       * @param name name of the shape to click the icon
       */
      clickAddOutputShapeIcon(name: string): Chainable;

      /**
       * Create a new left characteristic by clicking the left icon
       *
       * @param name name of the shape to click the icon
       */
      clickAddLeftShapeIcon(name: string): Chainable;

      /**
       * Create a new right characteristic by clicking the right icon
       *
       * @param name name of the shape to click the icon
       */
      clickAddRightShapeIcon(name: string): Chainable;

      /**
       * Create a new constraint by clicking the plus icon
       *
       * @param characteristicName name of the characteristic which connects to a new constraint via trait
       */
      clickAddTraitPlusIcon(characteristicName: string): Chainable;

      /**
       * Connect two shapes
       *
       * @param sourceName name of the source shape
       * @param targetName name of the target shape
       */
      clickConnectShapes(sourceName, targetName): Chainable;

      /**
       * Get the label of a child cell
       *
       * @param shape name of the shape
       * @param metaModelElementName element name e.g. description
       */
      getCellLabel(shape: string, metaModelElementName: string): Chainable;

      /**
       * Get the form filed by name
       *
       * @param name name of the field
       */
      getFormField(name: string): Chainable;

      /**
       * Trigger to update RDF and giv the RDF as string
       */
      getUpdatedRDF(): Chainable;

      /**
       * Check if the element exists and is visible
       *
       * @param name name of the shape
       */
      shapeExists(name: string): Chainable;

      /**
       * Check if the elements are connected
       *
       * @param sourceShapeName name of the source shape
       * @param targetShapeName name of the target shape
       */
      shapesConnected(sourceShapeName: string, targetShapeName: string): Chainable;

      /**
       * Gets element containing the exact text
       *
       * @param name name of the shape
       */
      getByText(text: string): Chainable;

      /**
       * Open AME
       */
      visitDefault(): Chainable;
    }
  }
}

Cypress.Commands.add('visitDefault', () => cy.visit('?e2e=true'));

Cypress.Commands.add('getAspect', () => cy.window().then(win => win['angular.modelService'].getLoadedAspectModel().aspect));

Cypress.Commands.add('getEditorService', () => cy.window().then(win => win['angular.editorService']));

Cypress.Commands.add('getMxgraphService', () => cy.window().then(win => win['angular.mxGraphService']));

Cypress.Commands.add('getMxgraphAttributeService', () => cy.window().then(win => win['angular.mxGraphAttributeService']));

Cypress.Commands.add('getModelService', () => cy.window().then(win => win['angular.modelService']));

Cypress.Commands.add('getHTMLCell', (name: string) =>
  cy.get(`[data-cell-id="${name}"]`).then($el => {
    $el.get(0).scrollIntoView({block: 'center'});
    return $el;
  })
);

Cypress.Commands.add('dbClickShape', (name: string) => {
  cy.clickShape(name).then(() => {
    cy.getHTMLCell(name).dblclick({force: true});
    cy.getHTMLCell(name).trigger('mousemove', {force: true});
  });

  return cy
    .get(SELECTOR_editorSaveButton)
    .should('exist')
    .then(() => cy.getHTMLCell(name));
});

Cypress.Commands.add('getCellLabel', (shape: string, keyName: string) => {
  return cy.getHTMLCell(shape).find(`.element-info[data-key="${keyName}"]`).invoke('attr', 'title');
});

Cypress.Commands.add('clickShape', cyHelp.clickShape);

Cypress.Commands.add('clickAddShapePlusIcon', (name: string) =>
  cy
    .window()
    .then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      const plusIcon = cyHelp.getAddShapeOverlay(foundShape);
      if (!plusIcon) {
        throw new Error('Add Shape Overlay not found');
      }
      plusIcon.fireEvent(new mxEventObject(mxEvent.CLICK));
      return foundShape;
    })
    .wait(250)
);

Cypress.Commands.add('clickAddInputShapeIcon', (name: string) =>
  cy
    .window()
    .then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      const inputIcon = cyHelp.getAddInputShapeOverlay(foundShape);
      if (!inputIcon) {
        throw new Error('Add Shape Overlay not found');
      }
      inputIcon.fireEvent(new mxEventObject(mxEvent.CLICK));
      return foundShape;
    })
    .wait(250)
);

Cypress.Commands.add('clickAddOutputShapeIcon', (name: string) =>
  cy
    .window()
    .then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      const outputIcon = cyHelp.getAddOutputShapeOverlay(foundShape);
      if (!outputIcon) {
        throw new Error('Add Shape Overlay not found');
      }
      outputIcon.fireEvent(new mxEventObject(mxEvent.CLICK));
      return foundShape;
    })
    .wait(250)
);

Cypress.Commands.add('clickAddLeftShapeIcon', (name: string) =>
  cy
    .window()
    .then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      const leftIcon = cyHelp.getAddLeftShapeOverlay(foundShape);
      if (!leftIcon) {
        throw new Error('Add Shape Overlay not found');
      }
      leftIcon.fireEvent(new mxEventObject(mxEvent.CLICK));
      return foundShape;
    })
    .wait(250)
);

Cypress.Commands.add('clickAddRightShapeIcon', (name: string) =>
  cy
    .window()
    .then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      const rightIcon = cyHelp.getAddRightShapeOverlay(foundShape);
      if (!rightIcon) {
        throw new Error('Add Shape Overlay not found');
      }
      rightIcon.fireEvent(new mxEventObject(mxEvent.CLICK));
      return foundShape;
    })
    .wait(250)
);

Cypress.Commands.add('clickAddTraitPlusIcon', (characteristicName: string) =>
  cy
    .window()
    .then(win => {
      const foundShape = cyHelp.findShapeByName(characteristicName, win);
      if (!foundShape) {
        throw new Error(`Shape ${characteristicName} not found`);
      }
      const constraintIcon = cyHelp.getAddConstraintOverlay(foundShape);
      if (!constraintIcon) {
        throw new Error('Add Constrain Overlay not found');
      }
      constraintIcon.fireEvent(new mxEventObject(mxEvent.CLICK));
      return foundShape;
    })
    .wait(250)
);

Cypress.Commands.add('clickConnectShapes', (nameSource, nameTarget) =>
  cy
    .then(() => cyHelp.clickShape(nameSource))
    .then(() => cyHelp.clickShape(nameTarget, true))
    .then(() => cy.get(SELECTOR_tbConnectButton).click({force: true}))
);

Cypress.Commands.add('getFormField', (name: string) => cy.get(`[ng-reflect-model="${name}"]`));

Cypress.Commands.add('dragElement', (selector: string, x: number, y: number) =>
  cy.getMxgraphAttributeService().then((service: MxGraphAttributeService) => {
    const container = service.graph.container;
    const {scrollLeft, scrollTop} = container;

    const graphX = scrollLeft + x;
    const graphY = scrollTop + y;

    if (Cypress.platform === 'darwin') {
      return cy
        .get(selector)
        .trigger('mousedown', 'left', {which: 1, force: true})
        .trigger('mousemove', {clientX: graphX, clientY: graphY, force: true, waitForAnimations: true})
        .then(() => cy.get('#graph > svg').click(graphX, graphY, {force: true}).trigger('mouseup', {force: true}));
    }

    return cy
      .get(selector)
      .trigger('pointerdown', {which: 1, force: true})
      .trigger('pointermove', {clientX: graphX, clientY: graphY, force: true, waitForAnimations: true})
      .then(() => cy.get('#graph > svg').click(graphX, graphY, {force: true}).trigger('pointerup', {force: true}));
  })
);

Cypress.Commands.add('getUpdatedRDF', () =>
  cy.window().then(win => {
    const modelService: ModelService = win['angular.modelService'];
    return new Promise(resolve => {
      modelService.synchronizeModelToRdf().subscribe(() => {
        const modelContent = modelService.getLoadedAspectModel().rdfModel;
        resolve(win['angular.rdfService'].serializeModel(modelContent));
      });
    });
  })
);

Cypress.Commands.add('getByText', name => cy.contains(new RegExp('^' + name + '$', 'g')));

Cypress.Commands.add('shapeExists', name => cy.getHTMLCell(name).should('exist'));

Cypress.Commands.add('shapesConnected', (sourceShapeName: string, targetShapeName: string) =>
  cy.window().then(win => {
    const sourceCell = cyHelp.findShapeByName(sourceShapeName, win);
    if (!sourceCell) {
      throw new Error(`Shape ${sourceShapeName} not found`);
    }
    const targetCell = cyHelp.findShapeByName(targetShapeName, win);
    if (!targetCell) {
      throw new Error(`Shape ${targetShapeName} not found`);
    }
    const mxGraphAttributeService: MxGraphAttributeService = win['angular.mxGraphAttributeService'];
    const shapesConnected = mxGraphAttributeService.graph.getOutgoingEdges(sourceCell).some(edge => edge.target === targetCell);
    if (!shapesConnected) {
      throw new Error(`Shape ${sourceShapeName} is not connected to ${targetShapeName}`);
    }
  })
);

Cypress.Commands.add('startModelling', () => {
  cy.intercept('POST', 'http://localhost:9091/ame/api/models/validate', {fixture: 'model-validation-response.json'});
  return cy
    .then(() => cy.get(SELECTOR_tbLoadButton).click({force: true}))
    .then(() => cy.get('[data-cy="create-model"]').click({force: true}))
    .then(() => cy.get(SELECTOR_modalsDropdown).click({force: true}))
    .then(() => cy.get(SELECTOR_dialogDefaultAspectButton).click({force: true}).wait(200))
    .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(200))
    .then(() => cy.get('ame-loading-screen', {timeout: 15000}).should('not.exist'));
});
