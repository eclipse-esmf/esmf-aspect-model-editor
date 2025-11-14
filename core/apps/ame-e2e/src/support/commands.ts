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

import {FileHandlingService, GenerateHandlingService} from '@ame/editor';
import {MxGraphAttributeService} from '@ame/mx-graph';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {ModelService} from '@ame/rdf/services';
import {SearchesStateService} from '@ame/utils';
import {Aspect} from '@esmf/aspect-model-loader';
import 'cypress-file-upload';
import {mxgraphFactory} from 'mxgraph-factory';
import {NAMESPACES_URL} from './api-mocks';
import {FIELD_see, SELECTOR_editorSaveButton, SELECTOR_tbConnectButton} from './constants';
import {cyHelp} from './helpers';

const {mxEventObject, mxEvent} = mxgraphFactory({});

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
       * Custom command to access the mxGraph service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getMxgraphService(): Chainable;

      /**
       * Custom command to access the mxGraph attribute service.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getMxgraphAttributeService(): Chainable;

      /**
       * Custom command to get the HTML cell containing all information about a specific cell by name.
       * @param name The name of the cell.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      getHTMLCell(name: string): Chainable;

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
       * Custom command to verify the existence and visibility of a shape within the model.
       * @param name The name of the shape to check.
       * @returns {Cypress.Chainable} A chainable Cypress object.
       */
      shapeExists(name: string): Chainable;

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

Cypress.Commands.add('visitDefault', () => cy.visit('/editor?e2e=true').wait(2000));

Cypress.Commands.add('getAspect', () => cy.window().then(win => win['angular.LoadedFilesService'].currentLoadedFile.aspect as Aspect));

Cypress.Commands.add('getEditorService', () => cy.window().then(win => win['angular.editorService']));
Cypress.Commands.add('getMxgraphService', () => cy.window().then(win => win['angular.mxGraphService']));

Cypress.Commands.add('getMxgraphAttributeService', () => cy.window().then(win => win['angular.mxGraphAttributeService']));

Cypress.Commands.add('getModelService', () => cy.window().then(win => win['angular.modelService']));

Cypress.Commands.add('getHTMLCell', (name: string) =>
  cy.get(`[data-cell-id="${name}"]`).then($el => {
    $el.get(0).scrollIntoView({block: 'center'});
    return $el;
  }),
);

Cypress.Commands.add('dbClickShape', (name: string) => {
  cy.getHTMLCell(name)
    .scrollIntoView()
    .dblclick({force: true})
    .then(() => cy.get(SELECTOR_editorSaveButton).should('exist'))
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
    .wait(250),
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
    .wait(250),
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
    .wait(250),
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
    .wait(250),
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
    .wait(250),
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
    .wait(250),
);

Cypress.Commands.add('clickConnectShapes', (nameSource, nameTarget) =>
  cy
    .then(() => cyHelp.clickShape(nameSource))
    .then(() => cyHelp.clickShape(nameTarget, true))
    .then(() => cy.get(SELECTOR_tbConnectButton).click({force: true})),
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
  }),
);

Cypress.Commands.add('startModellingInvalidModel', () => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/format', () => {});

  return cy.fixture('/invalid-file.txt', 'utf-8').then(model => {
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-with-error.json'});
    cy.intercept('POST', 'http://localhost:9090/ame/api/models/format', () => {});

    return cyHelp.loadModel(model);
  });
});

Cypress.Commands.add('startModelling', (ownNamespaceInterceptor = false) => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/format', () => {});

  if (!ownNamespaceInterceptor) {
    // TODO we have to move this somewhere else, because it is not needed for every test
    cy.intercept('GET', NAMESPACES_URL, {statusCode: 200, body: {}});
  }

  return cy.fixture('/default-models/aspect-default.txt', 'utf-8').then(model => cyHelp.loadModel(model));
});

Cypress.Commands.add('loadModel', (rdfString: string) => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/format', () => {});

  return cyHelp.loadModel(rdfString);
});

Cypress.Commands.add('saveAspectModelToWorkspace', () => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/validate', {fixture: 'model-validation-response.json'});
  cy.intercept('POST', 'http://localhost:9090/ame/api/models/format', {fixture: '/default-models/aspect-default.txt'});

  return cy.window().then(win => {
    const fileHandlingService: FileHandlingService = win['angular.fileHandlingService'];
    return fileHandlingService.saveAspectModelToWorkspace().subscribe();
  });
});

Cypress.Commands.add('openGenerationOpenApiSpec', () => {
  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/open-api-spec?language=en&output=json&baseUrl=https://example.com&includeQueryApi=false&useSemanticVersion=false&pagingOption=NO_PAGING&includePost=false&includePut=false&includePatch=false&resourcePath=/resource/%7BresourceId%7D&ymlProperties=&jsonProperties=',
    {fixture: 'AspectDefault-open-api.json'},
  );

  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/open-api-spec?language=en&output=yaml&baseUrl=https://example.com&includeQueryApi=false&useSemanticVersion=false&pagingOption=NO_PAGING&includePost=false&includePut=false&includePatch=false&resourcePath=null&ymlProperties=&jsonProperties=',
    {fixture: 'AspectDefault-open-api.yaml'},
  );

  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/open-api-spec?language=en&output=json&baseUrl=https://example.com&includeQueryApi=false&useSemanticVersion=false&pagingOption=NO_PAGING&includePost=false&includePut=false&includePatch=false&resourcePath=/resource/%7BresourceId%7D&ymlProperties=&jsonProperties=%7B%0A%20%20%22key%22:%20%22value%22%0A%7D',
    {fixture: 'AspectDefault-open-api.json'},
  );

  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/open-api-spec?language=en&output=yaml&baseUrl=https://example.com&includeQueryApi=false&useSemanticVersion=false&pagingOption=NO_PAGING&includePost=false&includePut=false&includePatch=false&resourcePath=/resource/%7BresourceId%7D&ymlProperties=resourceId:%0A%20%20name:%20resourceId%0A%20%20in:%20path%0A%20%20description:%20An%20example%20resource%20Id.%0A%20%20required:%20true%0A%20%20schema:%0A%20%20%20%20type:%20string%0A&jsonProperties=',
    {fixture: 'AspectDefault-open-api.yaml'},
  );

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationOpenApiSpec().afterClosed().subscribe();
  });
});

Cypress.Commands.add('openGenerationAsyncApiSpec', () => {
  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/async-api-spec?language=en&output=json&applicationId=application:id&channelAddress=foo/bar&useSemanticVersion=false&writeSeparateFiles=false',
    {fixture: 'AspectDefault-open-api.json'},
  );

  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/async-api-spec?language=en&output=yaml&applicationId=application:id&channelAddress=foo/bar&useSemanticVersion=false&writeSeparateFiles=false',
    {fixture: 'AspectDefault-open-api.json'},
  );

  cy.intercept(
    'POST',
    'http://localhost:9090/ame/api/generate/async-api-spec?language=en&output=json&applicationId=application:id&channelAddress=foo/bar&useSemanticVersion=false&writeSeparateFiles=true',
    {fixture: 'AspectDefault-open-api.json'},
  );

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationAsyncApiSpec().afterClosed().subscribe();
  });
});

Cypress.Commands.add('openGenerationDocumentation', () => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/generate/documentation?language=en', {fixture: 'valid-documentation.html'});

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.openGenerationDocumentation().afterClosed().subscribe();
  });
});

Cypress.Commands.add('openGenerationJsonSample', () => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/generate/json-sample', {fixture: 'valid-json.json'});

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.generateJsonSample().subscribe();
  });
});

Cypress.Commands.add('openGenerationJsonSchema', () => {
  cy.intercept('POST', 'http://localhost:9090/ame/api/generate/json-schema?language=en', {fixture: 'valid-json.json'});

  return cy.window().then(win => {
    const generateHandlingService: GenerateHandlingService = win['angular.generateHandlingService'];
    return generateHandlingService.generateJsonSchema().subscribe();
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
    cy.get(FIELD_see).clear({force: true}).type(element, {force: true}).get(`[data-cy="option__${element}"]`).click({force: true});
  }
});

Cypress.Commands.add('removeSeeElements', (...elements: string[]) => {
  if (elements.length === 0) {
    cy.get('[data-cy="see-remove-chip"]').each(element => cy.wrap(element).click({force: true}));
    return;
  }

  for (const element of elements) {
    cy.get(FIELD_see).clear({force: true}).get(`[data-cy="chip__${element}"] [data-cy="see-remove-chip"]`).click({force: true});
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
      const mxGraphAttributeService: MxGraphAttributeService = win['angular.mxGraphAttributeService'];
      return mxGraphAttributeService.graph.getOutgoingEdges(sourceCell).some(edge => edge.target === targetCell);
    });
  },
);
