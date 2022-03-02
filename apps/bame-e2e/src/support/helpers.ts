import {BaseMetaModelElement} from '@bame/meta-model';
import {MxGraphAttributeService} from '@bame/mx-graph';
import {mxgraph, mxgraphFactory} from 'mxgraph-factory';
import {FIELD_name, SELECTOR_editorSaveButton, SIDEBAR_CLOSE_BUTTON} from './constants';

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
      return foundShape?.overlays.every(({tooltip}) => tooltip === 'Add Left Characteristic' || tooltip === 'Add Right Characteristic');
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
          expect(rdf).to.contain(`bamm:properties (${propertiesRDFList.trim()})`);
          expect(rdf).to.contain(`:property${number} a bamm:Property`);
        });
      });
    });
  }

  static clickShape(name: string, selectMultipleShapes: boolean = false) {
    cy.getHTMLCell(name).should('exist');

    if (selectMultipleShapes) {
      cy.get('body').type('{ctrl}', {release: false});
    }

    const regexName = name;

    return cy
      .contains(new RegExp('^' + regexName + '$', 'g'))
      .first()
      .click({force: true});
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
      return !!foundShape['configuration'].find(conf => conf.key === 'shapeIconType');
    });
  }

  /**
   *
   * @param oldName
   * @param newName
   * @param oldLabel optional: if element label is different from name
   * @returns
   */
  static renameElement(oldName: string, newName: string, oldLabel?: string) {
    return cy
      .then(() => cy.dbClickShape(oldName, oldLabel))
      .then(() => cy.get(FIELD_name).clear().type(newName))
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
}
