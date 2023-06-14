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

import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphAttributeService} from '@ame/mx-graph';
import {mxgraph, mxgraphFactory} from 'mxgraph-factory';
import {
  FIELD_name,
  SELECTOR_dialogInputModel,
  SELECTOR_editorSaveButton,
  SELECTOR_fileMenuLoadAspectModelButton,
  SELECTOR_namespace,
  SELECTOR_namespaceFile,
  SELECTOR_namespaceFileMenuButton,
  SELECTOR_namespaceFileName,
  SELECTOR_namespaceName,
  SELECTOR_namespaceTabSaveButton,
  SELECTOR_namespaceTabValueInput,
  SELECTOR_namespaceTabVersionInput,
  SELECTOR_openNamespacesButton,
  SELECTOR_settingsButton,
  SELECTOR_settingsModalCloseButton,
  SELECTOR_tbLoadButton,
  SELECTOR_tbSaveButton,
  SELECTOR_tbSaveMenuSaveToWorkspaceButton,
  SIDEBAR_CLOSE_BUTTON,
} from './constants';

const {mxConstants} = mxgraphFactory({});

export class cyHelp {
  public static closeSidebar() {
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

  // TODO: after we replace the add buttons with those from label, change this
  public static findShapeByName(name: string, win: Window): mxgraph.mxCell {
    const mxGraphAttributeService: MxGraphAttributeService = win['angular.mxGraphAttributeService'];

    return mxGraphAttributeService.graph
      .getChildCells(mxGraphAttributeService.graph.getDefaultParent(), true, false)
      .find(cell => cell && cell.id === name);
  }

  static hasAddShapeOverlay(cellName: string) {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return !!foundShape?.overlays?.some(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_BOTTOM && !x);
    });
  }

  static hasAddInputAndOutputShapeOverlay(cellName: string) {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return foundShape?.overlays.every(({tooltip}) => tooltip === 'Add Input Property' || tooltip === 'Add Output Property');
    });
  }

  static hasAddLeftAndRightShapeOverlay(cellName: string) {
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

  static hasAddConstrainOverlay(cellName: string) {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(cellName, win);
      if (!foundShape) {
        throw new Error(`Shape ${cellName} not found`);
      }
      return !!foundShape?.overlays?.some(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_TOP && x > 0);
    });
  }

  static getAddShapeOverlay(cell: mxgraph.mxCell) {
    return cell?.overlays?.find(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_BOTTOM && !x);
  }

  static getAddInputShapeOverlay(cell: mxgraph.mxCell) {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Input Property');
  }

  static getAddOutputShapeOverlay(cell: mxgraph.mxCell) {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Output Property');
  }

  static getAddLeftShapeOverlay(cell: mxgraph.mxCell) {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Right Characteristic');
  }

  static getAddRightShapeOverlay(cell: mxgraph.mxCell) {
    return cell?.overlays?.find(({tooltip}) => tooltip === 'Add Left Characteristic');
  }

  static getAddConstraintOverlay(cell: mxgraph.mxCell) {
    return cell?.overlays?.find(({verticalAlign, offset: {x}}) => verticalAlign === mxConstants.ALIGN_TOP && x > 0);
  }

  static testShapeInCollapsedMode(name: string) {
    return cy.getHTMLCell(name).invoke('attr', 'data-collapsed').should('equal', 'yes');
  }

  static testShapeInExpandMode(name: string) {
    return cy.getHTMLCell(name).invoke('attr', 'data-collapsed').should('equal', 'no');
  }

  static addNewProperty(number: number): any {
    return cy.clickAddShapePlusIcon('AspectDefault').then(() => {
      cy.shapeExists(`property${number}`).then(() => {
        cy.getAspect().then(aspect => {
          expect(aspect.properties).to.have.length(number);
          expect(aspect.properties[number - 1].property.name).to.be.equal(`property${number}`);
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

  static clickShape(name: string, selectMultipleShapes = false) {
    cy.getHTMLCell(name).should('exist');

    if (selectMultipleShapes) {
      if (Cypress.platform !== 'darwin') {
        cy.get('body').type('{ctrl}', {release: false});
      } else {
        cy.get('body').type('{meta}', {release: false});
      }
    }

    return cy.getHTMLCell(name).first().click({force: true});
  }

  static getShapeLabels(name: string) {
    return cy.getHTMLCell(name).get('.element-info');
  }

  static getShapeLabelByKey(name: string, key: string) {
    return cy.getHTMLCell(name).get(`.element-info[data-key="${key}"]`);
  }

  static getAddShapePlusIcon(name: string) {
    return cy.window().then(win => {
      const foundShape = cyHelp.findShapeByName(name, win);
      if (!foundShape) {
        throw new Error(`Shape ${name} not found`);
      }
      return !!foundShape['configuration']?.fields.find(conf => conf.key === 'shapeIconType');
    });
  }

  /**
   *
   * @param oldName
   * @param newName
   * @param oldLabel optional: if element label is different from name
   * @returns
   */
  static renameElement(oldName: string, newName: string) {
    return cy
      .then(() => cy.dbClickShape(oldName))
      .then(() => cy.get(FIELD_name).clear({force: true}).type(newName, {force: true}))
      .then(() => cy.get(SELECTOR_editorSaveButton).focus().click({force: true}));
  }

  static assertNullMultiLanguageValues(modelElement: BaseMetaModelElement, langTag: string) {
    assert.isNull(modelElement.getDescription(langTag) || null);
    assert.isNull(modelElement.getDescription(langTag.toLowerCase()) || null);
    assert.isNull(modelElement.getPreferredName(langTag) || null);
    assert.isNull(modelElement.getPreferredName(langTag.toLowerCase()) || null);
  }

  static assertNotNullMultiLanguageValues(modelElement: BaseMetaModelElement, langTag: string) {
    assert.isNotNull(modelElement.getDescription(langTag));
    assert.isNotNull(modelElement.getPreferredName(langTag));
  }

  static loadCustomModel(rdfModel: string) {
    cy.get(SELECTOR_tbLoadButton).click({force: true});
    cy.get('[data-cy="create-model"]').click({force: true});
    cy.get(SELECTOR_dialogInputModel).invoke('val', rdfModel).trigger('input');
  }

  static loadModelFromWorkspace(namespaceName: string, fileNamePartial: string) {
    cy.get(SELECTOR_openNamespacesButton).click({force: true}).wait(1000);
    cy.get(SELECTOR_namespace)
      .find(SELECTOR_namespaceName)
      .contains(namespaceName)
      .parents(SELECTOR_namespace)
      .find(SELECTOR_namespaceFileName)
      .filter((index, element) => {
        const text = Cypress.$(element).text();
        return text.includes(fileNamePartial);
      })
      .parents(SELECTOR_namespaceFile)
      .find(SELECTOR_namespaceFileMenuButton)
      .click({force: true});
    cy.get(SELECTOR_fileMenuLoadAspectModelButton).click();
    cy.get('button').contains("Don't save").click();
    cy.wait(1000);
  }

  static saveCurrentModelToWorkspace() {
    cy.get(SELECTOR_tbSaveButton).click();
    cy.get(SELECTOR_tbSaveMenuSaveToWorkspaceButton).click();
  }

  static updateNamespace(name: string, version: string) {
    this.openSettingsTab(2);
    cy.get(SELECTOR_namespaceTabValueInput).clear().type(name);
    cy.get(SELECTOR_namespaceTabVersionInput).clear().type(version);
    cy.get(SELECTOR_namespaceTabSaveButton).click();
    cy.get('button').contains('Save').click();
  }

  static openSettingsTab(tabIndex: number) {
    cy.get(SELECTOR_settingsButton).click().wait(1000);
    cy.get(`.mat-tab-labels :nth-child(${tabIndex + 1})`).click();
  }
}
