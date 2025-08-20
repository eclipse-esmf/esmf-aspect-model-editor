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

import {FileHandlingService} from '@ame/editor';
import {MxGraphAttributeService} from '@ame/mx-graph';
import {NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph, mxgraphFactory} from 'mxgraph-factory';
import {finalize} from 'rxjs/operators';
import {FIELD_name, SELECTOR_editorSaveButton, SELECTOR_propertiesCancelButton, SIDEBAR_CLOSE_BUTTON} from './constants';

const {mxConstants} = mxgraphFactory({});

/**
 * Provides helper functions for performing various actions and checks in Cypress tests related to a graphical interface.
 */
export class cyHelp {
  /**
   * Clicks on a shape with the given name.
   * @returns {Cypress.Chainable} Cypress chainable object.
   */
  public static checkAspectDefaultExists(): Cypress.Chainable {
    return cy.clickShape('AspectDefault');
  }

  /**
   * Closes the sidebar if it is open by clicking the close button.
   * @returns {Cypress.Chainable} Cypress chainable object.
   */
  public static closeSidebar(): Cypress.Chainable {
    return cy
      .get('body')
      .find(SIDEBAR_CLOSE_BUTTON)
      .its('length')
      .then(length => {
        if (length) {
          cy.get(SIDEBAR_CLOSE_BUTTON).click({force: true});
        }
      });
  }

  /**
   * Forces Angular's change detection to run, updating the view with any data model changes.
   * @returns {Cypress.Chainable} Cypress chainable object.
   */
  public static forceChangeDetection(): Cypress.Chainable {
    let angular;
    let $document;
    return cy
      .window()
      .then(win => (angular = win['ng']))
      .then(() => cy.document().then(d => ($document = d)))
      .then(() => {
        const app = angular.getComponent($document.querySelector('ame-root'));
        angular.applyChanges(app);
      });
  }

  /**
   * Clicks the save button after forcing change detection.
   * @returns {Cypress.Chainable} Cypress chainable object.
   */
  public static clickSaveButton(): Cypress.Chainable {
    return this.forceChangeDetection().then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}));
  }

  public static clickPropertiesCancelButton(): Cypress.Chainable {
    return this.forceChangeDetection().then(() => cy.get(SELECTOR_propertiesCancelButton).focus().click({force: true}));
  }

  /**
   * Finds a shape by its name.
   * @param {string} name The name of the shape.
   * @param {Window} win The window object where the shape is located.
   * @returns {mxgraph.mxCell} The found mxCell if any.
   */
  public static findShapeByName(name: string, win: Window): mxgraph.mxCell {
    const mxGraphAttributeService: MxGraphAttributeService = win['angular.mxGraphAttributeService'];

    return mxGraphAttributeService.graph
      .getChildCells(mxGraphAttributeService.graph.getDefaultParent(), true, false)
      .find(cell => cell && cell.id === name);
  }

  /**
   * Finds the first shape that matches given fields.
   * @param {string} shapeName The name of the target shape.
   * @param {object[]} shapeFieldsPartialMatch Fields for partial matching.
   * @param {Cypress.AUTWindow} win The window object from the application under test.
   * @returns {mxgraph.mxCell} The found mxCell if any.
   */
  static findShapeByFields(shapeName: string, shapeFieldsPartialMatch: object[], win: Cypress.AUTWindow): mxgraph.mxCell {
    const mxGraphAttributeService: MxGraphAttributeService = win['angular.mxGraphAttributeService'];

    // Get all cells
    return mxGraphAttributeService.graph.getChildCells(null, true, false).find((cell: any) => {
      if (!cell) return false;
      if (cell.id !== shapeName) return false;

      // Check if this is the target cell (if it matches all the specified conditions for fields)
      return shapeFieldsPartialMatch.reduce((isMatch, field) => {
        const conditions = Object.entries(field);
        // Check if the field matches the specified conditions for a specific field
        const isTargetCell = cell.configuration.fields.some(cellField => {
          const missedCondition = conditions.find(([key, value]) => cellField[key] !== value);
          return !missedCondition;
        });

        return isTargetCell ? isMatch : false;
      }, true);
    });
  }

  /**
   * Checks if a shape has an add shape overlay.
   * @param {string} cellName The name of the cell to check.
   * @returns {Cypress.Chainable} Cypress chainable object indicating the presence of the overlay.
   */
  static hasAddShapeOverlay(cellName: string): Cypress.Chainable {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return !!foundShape?.overlays?.some(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_BOTTOM && !x);
    });
  }

  /**
   * Checks if a shape has both add input and output shape overlays.
   * @param {string} cellName The name of the cell to check.
   * @returns {Cypress.Chainable} Cypress chainable object indicating the presence of both input and output overlays.
   */
  static hasAddInputAndOutputShapeOverlay(cellName: string): Cypress.Chainable {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return foundShape?.overlays.every(({tooltip}) => tooltip === 'Add Input Property' || tooltip === 'Add Output Property');
    });
  }

  /**
   * Checks if a shape has both left and right shape overlays.
   * @param {string} cellName The name of the cell to check.
   * @returns {Cypress.Chainable} Cypress chainable object indicating the presence of left and right overlays.
   */
  static hasAddLeftAndRightShapeOverlay(cellName: string): Cypress.Chainable {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return (
        foundShape?.overlays.filter(({tooltip}) => tooltip === 'Add Left Characteristic' || tooltip === 'Add Right Characteristic')
          .length === 2
      );
    });
  }

  /**
   * Checks if a shape has an add constraint overlay.
   * @param {string} cellName The name of the cell to check.
   * @returns {Cypress.Chainable} Cypress chainable object indicating the presence of the constraint overlay.
   */
  static hasAddConstrainOverlay(cellName: string): Cypress.Chainable {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return !!foundShape?.overlays?.some(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_TOP && x > 0);
    });
  }

  /**
   * Retrieves the add shape overlay for a given cell.
   * @param {mxgraph.mxCell} cell The cell to check for the overlay.
   * @returns {mxgraph.mxCellOverlay} The add shape overlay, if present.
   */
  static getAddShapeOverlay(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_BOTTOM && !x);
  }

  /**
   * Retrieves the add input shape overlay for a given cell.
   * @param {mxgraph.mxCell} cell The cell to check for the input overlay.
   * @returns {mxgraph.mxCellOverlay} The add input shape overlay, if present.
   */
  static getAddInputShapeOverlay(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Input Property');
  }

  /**
   * Retrieves the add output shape overlay for a given cell.
   * @param {mxgraph.mxCell} cell The cell to check for the output overlay.
   * @returns {mxgraph.mxCellOverlay} The add output shape overlay, if present.
   */
  static getAddOutputShapeOverlay(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Output Property');
  }

  /**
   * Retrieves the add left shape overlay for a given cell.
   * @param {mxgraph.mxCell} cell The cell to check for the left overlay.
   * @returns {mxgraph.mxCellOverlay} The add left shape overlay, if present.
   */
  static getAddLeftShapeOverlay(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Right Characteristic');
  }

  /**
   * Retrieves the add right shape overlay for a given cell.
   * @param {mxgraph.mxCell} cell The cell to check for the right overlay.
   * @returns {mxgraph.mxCellOverlay} The add right shape overlay, if present.
   */
  static getAddRightShapeOverlay(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Left Characteristic');
  }

  /**
   * Retrieves the add constraint overlay for a given cell.
   * @param {mxgraph.mxCell} cell The cell to check for the constraint overlay.
   * @returns {mxgraph.mxCellOverlay} The add constraint overlay, if present.
   */
  static getAddConstraintOverlay(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_TOP && x > 0);
  }

  /**
   * Tests if a shape is in collapsed mode.
   * @param {string} name The name of the shape to test.
   * @returns {Cypress.Chainable} Cypress chainable object for assertion.
   */
  static testShapeInCollapsedMode(name: string): Cypress.Chainable {
    return cy.getHTMLCell(name).invoke('attr', 'data-collapsed').should('equal', 'yes');
  }

  /**
   * Tests if a shape is in expand mode.
   * @param {string} name The name of the shape to test.
   * @returns {Cypress.Chainable} Cypress chainable object for assertion.
   */
  static testShapeInExpandMode(name: string): Cypress.Chainable {
    return cy.getHTMLCell(name).invoke('attr', 'data-collapsed').should('equal', 'no');
  }

  /**
   * Adds a new property to a shape.
   * @param {number} number The identifier for the new property to be added.
   * @returns {any} The result of the property addition operation.
   */
  static addNewProperty(number: number): any {
    return cy.clickAddShapePlusIcon('AspectDefault').then(() => {
      cy.shapeExists(`property${number}`).then(() => {
        cy.getAspect().then(aspect => {
          expect(aspect.properties).to.have.length(number);
          expect(aspect.properties[number - 1].name).to.be.equal(`property${number}`);
        });
        cy.getUpdatedRDF().then(rdf => {
          let propertiesRDFList = '';
          for (let i = 1; i <= number; i++) {
            propertiesRDFList = propertiesRDFList + `:property${i} `;
          }
          expect(rdf).to.contain(`samm:properties (${propertiesRDFList.trim()})`);
          expect(rdf).to.contain(`:property${number} a samm:Property`);
        });
      });
    });
  }

  /**
   * Clicks on a shape by name. Supports selecting multiple shapes if needed.
   * @param {string} name The name of the shape to click.
   * @param {boolean} [selectMultipleShapes=false] Whether to select multiple shapes.
   * @returns {Cypress.Chainable} Cypress chainable object.
   */
  static clickShape(name: string, selectMultipleShapes = false): Cypress.Chainable {
    cy.getHTMLCell(name).should('exist');

    if (selectMultipleShapes) {
      if (Cypress.platform !== 'darwin') {
        cy.get('body').type('{ctrl}', {release: false, force: true});
      } else {
        cy.get('body').type('{meta}', {release: false, force: true});
      }
    }

    if (Cypress.platform !== 'darwin') {
      return cy
        .getHTMLCell(name)
        .first()
        .click({force: true})
        .then(() => cy.get('body').type('{ctrl}', {force: true}));
    } else {
      return cy
        .getHTMLCell(name)
        .first()
        .click({force: true})
        .then(() => cy.get('body').type('{meta}', {force: true}));
    }
  }

  /**
   * Gets a shape's label by key.
   * @param {string} name The name of the shape.
   * @param {string} key The key of the label to retrieve.
   * @returns {Cypress.Chainable} Cypress chainable object containing the label.
   */
  static getShapeLabelByKey(name: string, key: string) {
    return cy.getHTMLCell(name).get(`.element-info[data-key="${key}"]`);
  }

  /**
   * Checks if the add shape plus icon is present for a given shape name.
   * @param {string} name The name of the shape to check.
   * @returns {Cypress.Chainable} Cypress chainable object indicating the presence of the plus icon.
   */
  static getAddShapePlusIcon(name: string): Cypress.Chainable {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      return !!foundShape['configuration']?.fields.find(conf => conf.key === 'shapeIconType');
    });
  }

  /**
   * Renames a graph element from its current name to a new specified name.
   * @param {string} oldName - The current name of the element to be renamed.
   * @param {string} newName - The new name to assign to the element.
   * @returns {Cypress.Chainable} - Returns a chainable Cypress command that performs the rename operation.
   */

  static renameElement(oldName: string, newName: string): Cypress.Chainable {
    return cy
      .then(() => cy.dbClickShape(oldName))
      .then(() => cy.get('#graph').click({force: true}))
      .then(() => cy.get(FIELD_name).clear({force: true}).type(newName, {force: true}))
      .then(() => this.clickSaveButton());
  }

  /**
   * Asserts that multilanguage values for a given model element and language tag are null.
   * @param {NamedElement} modelElement - The model element to check.
   * @param {string} langTag - The language tag for which to check the values.
   */
  static assertNullMultiLanguageValues(modelElement: NamedElement, langTag: string): void {
    assert.isNull(modelElement.getDescription(langTag) || null);
    assert.isNull(modelElement.getDescription(langTag.toLowerCase()) || null);
    assert.isNull(modelElement.getPreferredName(langTag) || null);
    assert.isNull(modelElement.getPreferredName(langTag.toLowerCase()) || null);
  }

  /**
   * Asserts that multilanguage values for a given model element and language tag are not null.
   * @param {NamedElement} modelElement - The model element to check.
   * @param {string} langTag - The language tag for which to check the values.
   */
  static assertNotNullMultiLanguageValues(modelElement: NamedElement, langTag: string) {
    assert.isNotNull(modelElement.getDescription(langTag));
    assert.isNotNull(modelElement.getPreferredName(langTag));
  }

  /**
   * Loads a model from a given RDF string.
   * @param {string} rdfString - The RDF string representing the model to load.
   * @returns {Cypress.Chainable} - Returns a chainable Cypress command that performs the model load operation.
   */
  static loadModel(rdfString: string): Cypress.Chainable {
    return cy
      .window()
      .then(win => {
        const fileHandlingService: FileHandlingService = win['angular.fileHandlingService'];
        const sub = fileHandlingService
          .loadModel(rdfString)
          .pipe(finalize(() => sub.unsubscribe()))
          .subscribe();
        return sub;
      })
      .then(() => cy.get('ame-loading-screen', {timeout: 15000}).should('not.exist'));
  }
}
