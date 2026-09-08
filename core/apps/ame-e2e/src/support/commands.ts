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

import {FileHandlingService, GenerateHandlingService} from '@ame/editor';
import {MaxGraphAttributeService} from '@ame/max-graph';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {ModelService} from '@ame/rdf/services';
import {SearchesStateService} from '@ame/utils';
import {Aspect} from '@esmf/aspect-model-loader';
import {EventObject, InternalEvent} from '@maxgraph/core';
import 'cypress-file-upload';
import {API_BASE_URL, FORMAT_API_URL, setUpDefaultInterceptors, VALIDATE_API_URL} from './api-mocks';
import {FIELD_see, SELECTOR_editorSaveButton, SELECTOR_tbConnectButton} from './constants';
import {cyHelp} from './helpers';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to start modelling by creating a default model.
       * @param ownNamespaceInterceptor Optional flag to determine if the namespace interceptor should be used.       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      startModelling(ownNamespaceInterceptor?: boolean): Chainable;

      /**
       * Custom command to start modelling by creating a default invalid model.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      startModellingInvalidModel(): Chainable;

      /**
       * Custom command to load a model from a given RDF string.
       * @param rdfString The RDF string to load the model from.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      loadModel(rdfString: string): Chainable;

      /**
       * Custom command to save the current aspect model to the workspace.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      saveAspectModelToWorkspace(): Chainable;

      /**
       * Custom command to open the generation of OpenAPI specification.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      openGenerationOpenApiSpec(): Chainable;

      /**
       * Custom command to open the generation of AsyncAPI specification.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      openGenerationAsyncApiSpec(): Chainable;

      /**
       * Custom command to open the generation of documentation.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      openGenerationDocumentation(): Chainable;

      /**
       * Custom command to open the generation of JSON sample.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      openGenerationJsonSample(): Chainable;

      /**
       * Custom command to open the generation of JSON schema.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      openGenerationJsonSchema(): Chainable;

      /**
       * Custom command to open the generation of AASX specification.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      openGenerationAASX(): Chainable;

      /**
       * Custom command to access the state service used for searches.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      searchesStateService(): Chainable;

      /**
       * Custom command to access the namespaces manager service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      namespacesManagerService(): Chainable;

      /**
       * Custom command to retrieve the current aspect model.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getAspect(): Chainable;

      /**
       * Custom command to access the editor service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getEditorService(): Chainable;

      /**
       * Custom command to access the model service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getModelService(): Chainable;

      /**
       * Custom command to access the maxgraph service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getMaxgraphService(): Chainable;

      /**
       * Custom command to access the maxGraph attribute service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getMaxgraphAttributeService(): Chainable;

      /**
       * Custom command to get the HTML cell containing all information about a specific cell by name.
       * @param name The name of the cell.
       * @returns {Cypress.Chainable<JQuery<HTMLElement>>} A chainable Cypress object.
       */
      getHTMLCell(name: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to double-click a shape to open its editor, using the shape's internal name or its label name in the DOM.
       * @param name The internal name of the element.
       * @param labelName (Optional) The label name present in the DOM.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      dbClickShape(name: string, labelName?: string): Chainable;

      /**
       * Custom command to drag and drop an element by its selector to a new position specified by x and y coordinates.
       * @param selector The element's selector.
       * @param x The target drop position's x-coordinate.
       * @param y The target drop position's y-coordinate.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      dragElement(selector: string, x: number, y: number): Chainable;

      /**
       * Custom command to select a shape by clicking on it.
       * @param name The name of the shape to click.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickShape(name: string): Chainable;

      /**
       * Custom command to create a new shape by clicking the plus icon associated with a specific shape.
       * @param name The name of the shape where the plus icon will be clicked.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickAddShapePlusIcon(name: string): Chainable;

      /**
       * Custom command to create a new input property by clicking the left icon on a specific shape.
       * @param name The name of the shape where the input icon will be clicked.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickAddInputShapeIcon(name: string): Chainable;

      /**
       * Custom command to create a new output property by clicking the right icon on a specific shape.
       * @param name The name of the shape where the output icon will be clicked.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickAddOutputShapeIcon(name: string): Chainable;

      /**
       * Custom command to create a new left characteristic by clicking the left icon on a specific shape.
       * @param name The name of the shape where the left icon will be clicked.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickAddLeftShapeIcon(name: string): Chainable;

      /**
       * Custom command to create a new right characteristic by clicking the right icon on a specific shape.
       * @param name The name of the shape where the right icon will be clicked.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickAddRightShapeIcon(name: string): Chainable;

      /**
       * Custom command to create a new constraint by clicking the plus icon on a trait connected to a characteristic.
       * @param characteristicName The name of the characteristic which connects to a new constraint via a trait.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickAddTraitPlusIcon(characteristicName: string): Chainable;

      /**
       * Custom command to connect two shapes within the model.
       * @param sourceName The name of the source shape to start the connection.
       * @param targetName The name of the target shape to end the connection.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      clickConnectShapes(sourceName: string, targetName: string): Chainable;

      /**
       * Custom command to get the label of a child cell within a model shape.
       * @param shape The name of the parent shape.
       * @param metaModelElementName The element name (e.g., description) whose label is to be retrieved.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getCellLabel(shape: string, metaModelElementName: string): Chainable;

      /**
       * Custom command to get a form field by its name within the model editor or other UI component.
       * @param name The name of the form field to retrieve.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getFormField(name: string): Chainable;

      /**
       * Custom command to trigger an update of the RDF representation of the model and retrieve the RDF string.
       * @returns {Cypress.Chainable<unknown>} A chainable Cypress object containing the updated RDF string.
       */
      getUpdatedRDF(): Chainable<unknown>;

      /**
       * Custom command to verify if a shape exists in the graph.
       * @param name The name of the shape.
       * @param exists Whether the shape should exist or not (defaults to true).
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      shapeExists(name: string, exists?: boolean): Chainable;

      /**
       * Custom command to check if two shapes are connected within the model.
       * @param sourceShapeName The name of the source shape.
       * @param targetShapeName The name of the target shape.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      shapesConnected(sourceShapeName: string, targetShapeName: string): Chainable;

      /**
       * Custom command to retrieve an element containing exact text.
       * @param text The exact text to match in the element.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getByText(text: string): Chainable;

      /**
       * Custom command to navigate to the default application environment for modeling.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      visitDefault(): Chainable;

      /**
       * Custom command to add new elements to the 'see' field in a form or UI component.
       * @param elements A list of element names to add.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      addSeeElements(...elements: string[]): Chainable;

      /**
       * Custom command to remove elements from the 'see' field. If no elements are passed, all elements will be removed.
       * @param elements (Optional) A list of element names to remove.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      removeSeeElements(...elements: string[]): Chainable;

      /**
       * Custom command to check whether two elements are connected.
       * @param sourceShapeParams Object containing the name and optional fields of the source shape.
       * @param targetShapeParams Object containing the name and optional fields of the target shape.
       * @returns {Cypress.Chainable} A chainable Cypress object indicating whether the two elements are connected.
       */
      isConnected(
        sourceShapeParams: {name: string; fields?: object[]},
        targetShapeParams: {
          name: string;
          fields?: object[];
        },
      ): Chainable;
    }
  }
}

Cypress.Commands.add('visitDefault', () => {
  setUpDefaultInterceptors();
  cy.visit('/editor?e2e=true');
  cy.get('ame-loading-screen', {timeout: 15000}).should('not.exist');
  return cy.get('#graph', {timeout: 15000}).should('be.visible');
});

Cypress.Commands.add('getAspect', () => cy.window().then(win => win['angular.LoadedFilesService'].currentLoadedFile.aspect as Aspect));

Cypress.Commands.add('getEditorService', () => cy.window().then(win => win['angular.editorService']));
Cypress.Commands.add('getMaxgraphService', () => cy.window().then(win => win['angular.maxgraphService']));

Cypress.Commands.add('getMaxgraphAttributeService', () => cy.window().then(win => win['angular.maxgraphAttributeService']));

Cypress.Commands.add('getModelService', () => cy.window().then(win => win['angular.modelService']));

Cypress.Commands.add('getHTMLCell', (name: string) => cy.get(`[data-cell-id="${name}"], [data-cell-name="${name}"]`).first());

Cypress.Commands.add('dbClickShape', (name: string) => {
  return cy
    .getHTMLCell(name)
    .dblclick({force: true})
    .then(() => cy.get(SELECTOR_editorSaveButton).should('be.visible'))
    .then(() => cy.getHTMLCell(name));
});

Cypress.Commands.add('getCellLabel', (shape: string, keyName: string) => {
  return cy.getHTMLCell(shape).find(`.element-info[data-key="${keyName}"]`).invoke('attr', 'title');
});

Cypress.Commands.add('clickShape', cyHelp.clickShape);

Cypress.Commands.add('clickAddShapePlusIcon', (name: string) =>
  cy.window().then(win => {
    const foundShape = cyHelp.findShapeByName(name, win);
    if (!foundShape) {
      throw new Error(`Shape ${name} not found`);
    }
    const plusIcon = cyHelp.getAddShapeOverlay(foundShape);
    if (!plusIcon) {
      throw new Error('Add Shape Overlay not found');
    }
    plusIcon.fireEvent(new EventObject(InternalEvent.CLICK));
    return foundShape;
  }),
);

Cypress.Commands.add('clickAddInputShapeIcon', (name: string) =>
  cy.window().then(win => {
    const foundShape = cyHelp.findShapeByName(name, win);
    if (!foundShape) {
      throw new Error(`Shape ${name} not found`);
    }
    const inputIcon = cyHelp.getAddInputShapeOverlay(foundShape);
    if (!inputIcon) {
      throw new Error('Add Shape Overlay not found');
    }
    inputIcon.fireEvent(new EventObject(InternalEvent.CLICK));
    return foundShape;
  }),
);

Cypress.Commands.add('clickAddOutputShapeIcon', (name: string) =>
  cy.window().then(win => {
    const foundShape = cyHelp.findShapeByName(name, win);
    if (!foundShape) {
      throw new Error(`Shape ${name} not found`);
    }
    const outputIcon = cyHelp.getAddOutputShapeOverlay(foundShape);
    if (!outputIcon) {
      throw new Error('Add Shape Overlay not found');
    }
    outputIcon.fireEvent(new EventObject(InternalEvent.CLICK));
    return foundShape;
  }),
);

Cypress.Commands.add('clickAddLeftShapeIcon', (name: string) =>
  cy.window().then(win => {
    const foundShape = cyHelp.findShapeByName(name, win);
    if (!foundShape) {
      throw new Error(`Shape ${name} not found`);
    }
    const leftIcon = cyHelp.getAddLeftShapeOverlay(foundShape);
    if (!leftIcon) {
      throw new Error('Add Shape Overlay not found');
    }
    leftIcon.fireEvent(new EventObject(InternalEvent.CLICK));
    return foundShape;
  }),
);

Cypress.Commands.add('clickAddRightShapeIcon', (name: string) =>
  cy.window().then(win => {
    const foundShape = cyHelp.findShapeByName(name, win);
    if (!foundShape) {
      throw new Error(`Shape ${name} not found`);
    }
    const rightIcon = cyHelp.getAddRightShapeOverlay(foundShape);
    if (!rightIcon) {
      throw new Error('Add Shape Overlay not found');
    }
    rightIcon.fireEvent(new EventObject(InternalEvent.CLICK));
    return foundShape;
  }),
);

Cypress.Commands.add('clickAddTraitPlusIcon', (characteristicName: string) =>
  cy.window().then(win => {
    const foundShape = cyHelp.findShapeByName(characteristicName, win);
    if (!foundShape) {
      throw new Error(`Shape ${characteristicName} not found`);
    }
    const constraintIcon = cyHelp.getAddConstraintOverlay(foundShape);
    if (!constraintIcon) {
      throw new Error('Add Constrain Overlay not found');
    }
    constraintIcon.fireEvent(new EventObject(InternalEvent.CLICK));
    return foundShape;
  }),
);

Cypress.Commands.add('clickConnectShapes', (nameSource, nameTarget) =>
  cy
    .then(() => cyHelp.clickShape(nameSource))
    .then(() => cyHelp.clickShape(nameTarget, true))
    .then(() => cy.get(SELECTOR_tbConnectButton).click({force: true})),
);

Cypress.Commands.add('getFormField', (name: string) => cy.get(`[ng-reflect-model="${name}"]`));

Cypress.Commands.add('dragElement', (selector: string, x: number, y: number) =>
  cy.getMaxgraphAttributeService().then((service: MaxGraphAttributeService) => {
    const container = service.graph.container;
    const {scrollLeft, scrollTop} = container;

    const graphX = scrollLeft + x;
    const graphY = scrollTop + y;

    if (Cypress.platform === 'darwin') {
      return cy
        .get(selector)
        .first()
        .trigger('mousedown', 'left', {which: 1, force: true})
        .trigger('mousemove', {clientX: graphX, clientY: graphY, force: true, waitForAnimations: true})
        .then(() => cy.get('#graph > svg').click(graphX, graphY, {force: true}).trigger('mouseup', {force: true}));
    }

    return cy
      .get(selector)
      .first()
      .trigger('pointerdown', {button: 0, force: true})
      .trigger('pointermove', {clientX: graphX, clientY: graphY, force: true, waitForAnimations: true})
      .then(() => cy.get('#graph > svg').click(graphX, graphY, {force: true}).trigger('pointerup', {force: true}));
  }),
);

Cypress.Commands.add('getUpdatedRDF', () =>
  cy.window().then(win => {
    const modelService: ModelService = win['angular.modelService'];
    return new Promise(resolve => {
      modelService.synchronizeModelToRdf().subscribe(() => {
        const modelContent = win['angular.LoadedFilesService'].currentLoadedFile.rdfModel;
        resolve(win['angular.rdfService'].serializeModel(modelContent));
      });
    });
  }),
);

Cypress.Commands.add('getByText', name => cy.contains(new RegExp('^' + name + '$', 'g')));

Cypress.Commands.add('shapeExists', (name: string, exists = true) =>
  exists ? cy.getHTMLCell(name).should('exist') : cy.get(`[data-cell-id="${name}"], [data-cell-name="${name}"]`).should('not.exist'),
);

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
    const maxgraphAttributeService: MaxGraphAttributeService = win['angular.maxgraphAttributeService'];
    const shapesConnected = maxgraphAttributeService.graph.getOutgoingEdges(sourceCell, null).some(edge => edge.target === targetCell);
    if (!shapesConnected) {
      throw new Error(`Shape ${sourceShapeName} is not connected to ${targetShapeName}`);
    }
  }),
);

Cypress.Commands.add('startModellingInvalidModel', () => {
  return cy.fixture('/invalid-file.txt', 'utf-8').then(model => {
    cy.intercept('POST', VALIDATE_API_URL, {fixture: 'model-validation-with-error.json'}).as('validateInvalidModel');
    return cyHelp.loadModel(model);
  });
});

Cypress.Commands.add('startModelling', () => {
  return cy.fixture('/default-models/aspect-default.txt', 'utf-8').then(model => cyHelp.loadModel(model));
});

Cypress.Commands.add('loadModel', (rdfString: string) => {
  return cyHelp.loadModel(rdfString);
});

Cypress.Commands.add('saveAspectModelToWorkspace', () => {
  cy.intercept('POST', FORMAT_API_URL, {fixture: '/default-models/aspect-default.txt'}).as('formatWorkspaceModel');

  return cy.window().then(win => {
    const fileHandlingService: FileHandlingService = win['angular.fileHandlingService'];
    return fileHandlingService.saveAspectModelToWorkspace().subscribe();
  });
});

Cypress.Commands.add('openGenerationOpenApiSpec', () => {
  cy.get('mat-dialog-container').should('not.exist');
  cy.intercept('POST', /\/generate\/open-api-spec(\?.*)?$/, req => {
    if (req.url.includes('output=yaml')) {
      req.reply({fixture: 'AspectDefault-open-api.yaml'});
    } else {
      req.reply({fixture: 'AspectDefault-open-api.json'});
    }
  });

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationOpenApiSpec().afterClosed().subscribe();
  });
});

Cypress.Commands.add('openGenerationAsyncApiSpec', () => {
  cy.get('mat-dialog-container').should('not.exist');
  cy.intercept('POST', /\/generate\/async-api-spec(\?.*)?$/, req => {
    if (req.url.includes('writeSeparateFiles=true')) {
      req.reply({fixture: 'AspectDefault-open-api.json'});
    } else if (req.url.includes('output=yaml')) {
      req.reply({fixture: 'AspectDefault-open-api.yaml'});
    } else {
      req.reply({fixture: 'AspectDefault-open-api.json'});
    }
  });

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationAsyncApiSpec().afterClosed().subscribe();
  });
});

Cypress.Commands.add('openGenerationDocumentation', () => {
  cy.get('mat-dialog-container').should('not.exist');
  cy.intercept('POST', `${API_BASE_URL}/generate/documentation?language=en`, {fixture: 'valid-documentation.html'});

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationDocumentation().afterClosed().subscribe();
  });
});

Cypress.Commands.add('openGenerationJsonSample', () => {
  cy.get('mat-dialog-container').should('not.exist');
  cy.intercept('POST', `${API_BASE_URL}/generate/json-sample`, {fixture: 'valid-json.json'});

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.generateJsonSample().subscribe();
  });
});

Cypress.Commands.add('openGenerationJsonSchema', () => {
  cy.get('mat-dialog-container').should('not.exist');
  cy.intercept('POST', `${API_BASE_URL}/generate/json-schema?language=en`, {fixture: 'valid-json.json'});

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.generateJsonSchema().subscribe();
  });
});

Cypress.Commands.add('openGenerationAASX', () => {
  cy.get('mat-dialog-container').should('not.exist');
  cy.intercept('POST', /\/generate\/(aasx|aas-xml)(\?.*)?$/, req => {
    req.reply({body: '<aasx-blob-content>'});
  });

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationAASX().afterClosed().subscribe();
  });
});

Cypress.Commands.add('searchesStateService', () => {
  return cy.window().then(win => {
    const searchesStateService: SearchesStateService = win['angular.searchesStateService'];
    return searchesStateService.elementsSearch.toggle();
  });
});

Cypress.Commands.add('namespacesManagerService', () => {
  return cy.window().then(win => {
    const namespacesManagerService: NamespacesManagerService = win['angular.namespacesManagerService'];
    return namespacesManagerService.onExportNamespaces();
  });
});

Cypress.Commands.add('addSeeElements', (...elements: string[]) => {
  for (const element of elements) {
    cy.get(FIELD_see).clear({force: true}).type(element, {force: true});
    cy.get(`[data-cy="option__${element}"]`).click({force: true});
  }
});

Cypress.Commands.add('removeSeeElements', (...elements: string[]) => {
  if (elements.length === 0) {
    cy.get('[data-cy="see-remove-chip"]').each(element => cy.wrap(element).click({force: true}));
    return;
  }

  for (const element of elements) {
    cy.get(FIELD_see).clear({force: true});
    cy.get(`[data-cy="chip__${element}"] [data-cy="see-remove-chip"]`).click({force: true});
  }
});

Cypress.Commands.add(
  'isConnected',
  (
    sourceShapeParams: {name: string; fields?: object[]},
    targetShapeParams: {
      name: string;
      fields?: object[];
    },
  ) => {
    return cy.window().then(win => {
      const sourceCell = cyHelp.findShapeByName(sourceShapeParams.name, win);
      if (!sourceCell) {
        throw new Error(`Shape ${sourceShapeParams.name} not found`);
      }
      const targetCell = cyHelp.findShapeByFields(targetShapeParams.name, targetShapeParams.fields || [], win);
      if (!targetCell) {
        throw new Error(`Shape ${targetShapeParams.name} not found`);
      }
      const maxgraphAttributeService: MaxGraphAttributeService = win['angular.maxgraphAttributeService'];
      return maxgraphAttributeService.graph.getOutgoingEdges(sourceCell, null).some(edge => edge.target === targetCell);
    });
  },
);
