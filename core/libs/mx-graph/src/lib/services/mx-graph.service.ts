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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {Observable, Subject} from 'rxjs';
import {MxGraphShapeOverlayService} from './mx-graph-shape-overlay.service';
import {MxGraphAttributeService} from './mx-graph-attribute.service';
import {MxGraphShapeSelectorService} from './mx-graph-shape-selector.service';
import {environment} from 'environments/environment';
import {MxGraphGeometryProviderService, MxGraphSetupService} from '.';
import {MxGraphCharacteristicHelper, MxGraphHelper, PropertyInformation} from '../helpers';
import {mxCell, mxConstants, mxUtils} from '../providers';
import {Base, BaseMetaModelElement, DefaultAbstractProperty, DefaultEntityValue, DefaultProperty} from '@ame/meta-model';
import {MxAttributeName} from '../models';
import {ConfigurationService} from '@ame/settings-dialog';
import {CollapsedOverlay, ExpandedOverlay, NotificationsService} from '@ame/shared';
import {NamespacesCacheService} from '@ame/cache';
import {ThemeService} from '../themes/theme.service';

@Injectable()
export class MxGraphService {
  private document: Document;

  public firstTimeFold = true;
  public graph: mxgraph.mxGraph;

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  constructor(
    private namespacesCacheService: NamespacesCacheService,
    private configurationService: ConfigurationService,
    private graphSetupService: MxGraphSetupService,
    private mxGraphGeometryProviderService: MxGraphGeometryProviderService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private notificationsService: NotificationsService,
    private themeService: ThemeService,
    public mxGraphShapeSelectorService: MxGraphShapeSelectorService
  ) {
    this.document = mxUtils.createXmlDocument();
    if (!environment.production) {
      window['angular.mxGraphService'] = this;
    }
  }

  initGraph(): void {
    this.graphSetupService.setUp();
    this.graph = this.mxGraphAttributeService.graph;
    this.themeService.setGraph(this.graph);

    mxCell.prototype.clone = function () {
      return this;
    };
  }

  /**
   * Method to update the graph.Increments the updateLevel by one.
   * The event notification is queued until updateLevel reaches 0 by use of endUpdate.
   * All changes on mxGraphModel are transactional, that is, they are executed in a single un-doable change on the model
   * (without transaction isolation).  Therefore, if you want to combine any number of changes into a single un-doable change,
   * you should group any two or more API calls that modify the graph model between beginUpdate and endUpdate
   */
  updateGraph(updateFunction: Function): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.mxGraphAttributeService.graph.model.beginUpdate();
    try {
      updateFunction?.();
    } finally {
      requestAnimationFrame(() => {
        this.mxGraphAttributeService.graph.model.endUpdate();
        subject.next(true);
      });
    }

    return subject.asObservable();
  }

  /**
   * Gets cell parents
   *
   * @param cell most basic entity of a mx-graph model,
   * @returns array of parent cells
   */
  resolveParents(cell: mxgraph.mxCell): Array<mxgraph.mxCell> {
    return this.mxGraphAttributeService.graph.getIncomingEdges(cell).map(parent => parent.source);
  }

  /**
   * Gets the cell for a specific model element
   *
   * @param metaModelElement
   * @returns the cell that you want to resolve
   */
  resolveCellByModelElement(metaModelElement: BaseMetaModelElement): mxgraph.mxCell {
    return this.mxGraphAttributeService.graph
      .getChildVertices(this.mxGraphAttributeService.graph.getDefaultParent())
      .find(
        cell =>
          MxGraphHelper.getModelElement(cell) && MxGraphHelper.getModelElement(cell).aspectModelUrn === metaModelElement.aspectModelUrn
      );
  }

  /**
   * Modifies certain model Element with a new cell configuration
   *
   * @param metaModelElement element model
   * @param cellConfiguration cell visual configuration
   * @param x optional x parameter used for shape geometry
   * @param y optional y parameter used for shape geometry
   * @returns a new configured cell
   */
  renderModelElement(
    metaModelElement: BaseMetaModelElement,
    cellConfiguration: PropertyInformation[] = [],
    x?: number,
    y?: number
  ): mxgraph.mxCell {
    let modelShape: mxgraph.mxCell;
    const geometry = this.mxGraphGeometryProviderService.createGeometry(metaModelElement, x, y);
    try {
      modelShape = this.mxGraphShapeOverlayService.createShape(metaModelElement, geometry, cellConfiguration);
      MxGraphHelper.setModelElement(modelShape, metaModelElement);

      this.themeService.applyShapeStyle(modelShape);

      if (metaModelElement.isExternalReference()) {
        const style = this.mxGraphAttributeService.graph.getModel().getStyle(modelShape);
        const newStyle = mxUtils.setStyle(style, mxConstants.STYLE_FILL_OPACITY, 80);
        this.mxGraphAttributeService.graph.setCellStyle(newStyle, [modelShape]);
      }

      this.mxGraphShapeOverlayService.checkComplexEnumerationOverlays(metaModelElement, modelShape);

      if (!metaModelElement.isExternalReference()) {
        this.mxGraphShapeOverlayService.addBottomShapeOverlay(modelShape);
        this.mxGraphShapeOverlayService.addTopShapeOverlay(modelShape);
      }
    } finally {
      this.mxGraphAttributeService.inCollapsedMode ? this.foldCell(modelShape) : this.expandCell(modelShape);
      this.mxGraphAttributeService.graph.resizeCell(modelShape, geometry);
    }
    return modelShape;
  }

  /**
   * Update all enumerations, parent entity values where deleted entityValue is linked.
   * Delete all child entity values
   *
   * @param selectedModelElement - EntityValue meta model which will be deleted
   */
  public updateEnumerationsWithEntityValue(selectedModelElement: DefaultEntityValue): void {
    if (selectedModelElement.isExternalReference()) {
      return;
    }

    selectedModelElement.parents.forEach(enumeration => {
      const entityValueIndex = enumeration.values.indexOf(selectedModelElement);
      if (entityValueIndex >= 0) {
        enumeration.values.splice(entityValueIndex, 1);
      }
    });

    // update all parent entity values
    const allEntityValues = this.currentCachedFile.getCachedEntityValues();
    allEntityValues.forEach(entityValue => {
      entityValue.properties.forEach(prop => {
        if (prop.value?.['aspectModelUrn'] === selectedModelElement.aspectModelUrn) {
          prop.value = undefined;
        }
      });
    });

    this.currentCachedFile.removeCachedElement(selectedModelElement.aspectModelUrn);
    // delete all lower entity values that don't belong to an enumeration
    const lowerEntityValuesToDelete = MxGraphCharacteristicHelper.getChildEntityValuesToDelete(selectedModelElement, []);
    lowerEntityValuesToDelete.forEach(entityValue => {
      this.currentCachedFile.removeCachedElement(entityValue.aspectModelUrn);
      this.removeCells([this.resolveCellByModelElement(entityValue)]);
    });
  }

  removeCellChild(parent: mxgraph.mxCell, childName: string) {
    const child = parent?.children?.find(childCell => childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY) === childName);
    this.removeCells([child]);
  }

  getAllEdges(cellId: string): mxgraph.mxCell[] {
    return this.mxGraphAttributeService.graph.model.getCell(cellId)?.edges;
  }

  /**
   * Navigate to a cell based on URN
   *
   * @param aspectModelUrn aspect URN
   * @returns navigated cell
   */
  navigateToCellByUrn(aspectModelUrn: string): mxgraph.mxCell {
    const cellToNavigate = Object.values<mxgraph.mxCell>(this.mxGraphAttributeService.graph.model.cells).find((cell: mxgraph.mxCell) => {
      const metaElement = MxGraphHelper.getModelElement(cell);
      if (metaElement && metaElement.aspectModelUrn === aspectModelUrn) {
        return cell;
      }
      return null;
    });

    return this.navigateToCell(cellToNavigate, true);
  }

  /**
   * Navigate to a cell
   *
   * @param cell mx element
   * @param center flag to signal if the cell should be visible on the center
   * @returns navigated cell
   */
  navigateToCell(cell: mxgraph.mxCell, center: boolean): mxgraph.mxCell {
    if (!cell) {
      this.notificationsService.error('The shape you are looking for was not found');
      return null;
    }

    this.mxGraphAttributeService.graph.selectCellForEvent(cell);
    this.mxGraphAttributeService.graph.scrollCellToVisible(cell, center);

    return cell;
  }

  /** Removes all elements of the current aspect  */
  deleteAllShapes(): void {
    this.updateGraph(() =>
      this.mxGraphAttributeService.graph.removeCells(
        this.mxGraphAttributeService.graph.getChildVertices(this.mxGraphAttributeService.graph.getDefaultParent())
      )
    );
  }

  /** Expand all cells*/
  expandCells() {
    this.updateGraph(() => {
      const cells = this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent(), true, false);
      this.mxGraphAttributeService.graph.foldCells(false, true, cells);
      this.mxGraphAttributeService.inCollapsedMode = false;

      cells.forEach(cell => {
        this.mxGraphAttributeService.graph.resizeCell(
          cell,
          this.mxGraphGeometryProviderService.createGeometry(MxGraphHelper.getModelElement(cell), cell?.geometry?.x, cell?.geometry?.y)
        );
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (MxGraphHelper.isComplexEnumeration(modelElement)) {
          this.mxGraphShapeOverlayService.addComplexEnumerationShapeOverlay(cell);
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = ExpandedOverlay.width;
          overlay.image.height = ExpandedOverlay.height;

          MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });
      });
      this.formatShapes(true);
    }).subscribe(() => {
      const selectedCell = this.mxGraphShapeSelectorService.getSelectedShape();
      if (selectedCell) {
        this.navigateToCell(selectedCell, true);
      }
      if (this.firstTimeFold) {
        this.firstTimeFold = false;
        this.formatShapes(true);
        this.graph.refresh();
      }
    });
  }

  /** Collapse all cells */
  foldCells() {
    this.updateGraph(() => {
      const cells = this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent(), true, false);
      this.mxGraphAttributeService.graph.foldCells(true, true, cells);

      cells.forEach(cell => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (MxGraphHelper.isComplexEnumeration(modelElement)) {
          this.mxGraphShapeOverlayService.removeOverlay(cell, MxGraphHelper.getRightOverlayButton(cell));
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = CollapsedOverlay.width;
          overlay.image.height = CollapsedOverlay.height;

          MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });

        const geometry = this.mxGraphAttributeService.graph.model.getGeometry(cell);
        const isVertex = this.mxGraphAttributeService.graph.model.isVertex(cell);
        this.mxGraphGeometryProviderService.upgradeTraitGeometry(cell, geometry, isVertex);
        this.mxGraphGeometryProviderService.upgradeEntityValueGeometry(cell, geometry, isVertex);
      });

      this.mxGraphAttributeService.inCollapsedMode = true;
      this.formatShapes(true);
    }).subscribe(() => {
      const selectedCell = this.mxGraphShapeSelectorService.getSelectedShape();
      if (selectedCell) {
        this.navigateToCell(selectedCell, true);
      }
      if (this.firstTimeFold) {
        this.formatShapes(true);
        this.firstTimeFold = false;
        this.graph.refresh();
      }
    });
  }

  /**
   * Expand a targeted cell
   *
   * @param cell mx element
   */
  expandCell(cell: mxgraph.mxCell): void {
    this.mxGraphAttributeService.graph.foldCells(false, false, [cell]);
  }

  /**
   * Collapse a targeted cell
   *
   * @param cell mx element
   */
  foldCell(cell: mxgraph.mxCell): void {
    this.mxGraphAttributeService.graph.foldCells(true, false, [cell]);
  }

  /** Re-formats entire schematic. */
  formatShapes(force: boolean = false): void {
    if (!this.configurationService.getSettings().autoFormatEnabled && !force) {
      return;
    }
    if (this.mxGraphAttributeService.graph.getDefaultParent().children !== undefined) {
      this.configurationService.getSettings().enableHierarchicalLayout
        ? MxGraphHelper.setHierarchicalLayout(this.mxGraphAttributeService.graph, this.mxGraphAttributeService.inCollapsedMode)
        : MxGraphHelper.setCompactTreeLayout(this.mxGraphAttributeService.graph, this.mxGraphAttributeService.inCollapsedMode);
    }
  }

  formatCell(cell: mxgraph.mxCell) {
    if (this.configurationService.getSettings().autoFormatEnabled) {
      // don't apply cell formatting in case auto format is enabled
      return;
    }
    const initialX = cell.geometry.x;
    const initialY = cell.geometry.y;
    const formattedCells = [];
    if (this.mxGraphAttributeService.graph.getDefaultParent().children !== undefined) {
      this.configurationService.getSettings().enableHierarchicalLayout
        ? MxGraphHelper.setHierarchicalLayout(this.mxGraphAttributeService.graph, this.mxGraphAttributeService.inCollapsedMode, cell)
        : MxGraphHelper.setCompactTreeLayout(this.mxGraphAttributeService.graph, this.mxGraphAttributeService.inCollapsedMode, cell);
    }
    this.updateGraph(() => {
      const deltaX = initialX - cell.geometry.x;
      const deltaY = initialY - cell.geometry.y;
      this.applyDelta(cell, deltaX, deltaY, formattedCells);
    }).subscribe(() => {
      this.graph.refresh();
    });
  }

  /**
   * Connect a cell to parent
   *
   * @param child child mx element
   * @param parent parent mx element
   */
  assignToParent(child: mxgraph.mxCell, parent?: mxgraph.mxCell): void {
    const parentModel = MxGraphHelper.getModelElement(parent);
    const childModel = MxGraphHelper.getModelElement(child);

    const abstractRelations = {
      DefaultAbstractEntity: ['DefaultAbstractEntity'],
      DefaultEntity: ['DefaultAbstractEntity', 'DefaultEntity'],
      DefaultProperty: ['DefaultAbstractProperty', 'DefaultProperty'],
      DefaultAbstractProperty: ['DefaultAbstractProperty'],
    };

    const cellStyle =
      parentModel instanceof DefaultEntityValue && !(MxGraphHelper.getModelElement(child) instanceof DefaultEntityValue)
        ? 'entityValueEntityEdge'
        : MxGraphHelper.isOptionalProperty(MxGraphHelper.getModelElement(child), parentModel)
        ? 'optionalPropertyEdge'
        : childModel instanceof DefaultAbstractProperty && parentModel instanceof DefaultProperty
        ? 'abstractPropertyEdge'
        : abstractRelations[parentModel.className]?.includes(childModel.className)
        ? 'abstractElementEdge'
        : 'defaultEdge';

    if (
      parent.edges &&
      parent.edges.find(
        edge => MxGraphHelper.getModelElement(edge.target).aspectModelUrn === MxGraphHelper.getModelElement(child).aspectModelUrn
      )
    ) {
      return;
    }
    this.mxGraphAttributeService.graph.insertEdge(
      this.mxGraphAttributeService.graph.getDefaultParent(),
      null,
      null,
      parent,
      child,
      cellStyle
    );
  }

  /**
   * Show validation error on a cell based on an URN string
   *
   * @param focusNodeUrn focused node URN
   */
  showValidationErrorOnShape(focusNodeUrn: string): void {
    Object.values<mxgraph.mxCell>(this.mxGraphAttributeService.graph.model.cells).forEach((cell: mxgraph.mxCell) => {
      const modelElement = MxGraphHelper.getModelElement(cell);
      if (modelElement && modelElement.aspectModelUrn === focusNodeUrn) {
        this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'red', [cell]);
        this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 3, [cell]);
      }
    });
  }

  /** Resets entire validation */
  resetValidationErrorOnAllShapes(): void {
    this.updateGraph(() => {
      Object.values<mxgraph.mxCell>(this.mxGraphAttributeService.graph.model.cells).forEach((cell: mxgraph.mxCell) => {
        if (!cell.isEdge()) {
          this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, this.themeService.currentColors.border, [cell]);
          this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 2, [cell]);
        }
      });
    });
  }

  removeCells(cells: Array<mxgraph.mxCell>): void {
    this.mxGraphAttributeService.graph.removeCells(cells);
  }

  moveCells(cells: Array<mxgraph.mxCell>, dx: number, dy: number): void {
    this.mxGraphAttributeService.graph.moveCells(cells, dx, dy);
  }

  /**
   *
   * @returns array with all available cells(mx elements)
   */
  getAllCells(): mxgraph.mxCell[] {
    return this.mxGraphAttributeService.graph.getChildVertices(this.mxGraphAttributeService.graph.getDefaultParent());
  }

  /**
   * This method will search in cache for all entryValues, find the ones with properties = deleted entity value and clear this properties.
   *
   * @param deletedEntityValue - EntityValueProperty.value that needs to be cleared.
   */
  public updateEntityValuesWithReference(deletedEntityValue: DefaultEntityValue): void {
    if (deletedEntityValue.isExternalReference()) {
      return;
    }

    this.namespacesCacheService
      .getCurrentCachedFile()
      .getCachedEntityValues()
      .forEach(entityValue =>
        entityValue.properties
          .filter(property => property.value instanceof DefaultEntityValue)
          .filter(property => (<DefaultEntityValue>property.value).aspectModelUrn === deletedEntityValue.aspectModelUrn)
          .forEach(entityValueToUpdate => (entityValueToUpdate.value = ''))
      );
  }

  /**
   * This method will transform cell to modelElement and update all the references where deletedEntityValueCells ar present.
   *
   * @param deletedEntityValueCells - cell which needs to be cleaned
   */
  public updateEntityValuesWithCellReference(deletedEntityValueCells: Array<mxgraph.mxCell>): void {
    deletedEntityValueCells
      .filter(entityValueCell => entityValueCell.isVertex())
      .forEach(entityValueCell => this.updateEntityValuesWithReference(MxGraphHelper.getModelElement(entityValueCell)));
  }

  private applyDelta(cell, deltaX, deltaY, formattedCells) {
    if (!cell || formattedCells.includes(cell)) {
      return;
    }
    formattedCells.push(cell);
    cell.geometry.x += deltaX;
    cell.geometry.y += deltaY;

    const edgesToRedraw = this.graph.getOutgoingEdges(cell);
    const modelElement = MxGraphHelper.getModelElement(cell);

    Object.keys(modelElement)
      .filter(attributeName => attributeName !== 'parents')
      .forEach(attributeName => {
        const attributeValue: any = modelElement[attributeName];
        if (attributeValue instanceof Base) {
          return this.applyDelta(this.resolveCellByModelElement(attributeValue), deltaX, deltaY, formattedCells);
        }

        if (attributeValue?.property && attributeValue?.keys) {
          return this.applyDelta(this.resolveCellByModelElement(attributeValue.property), deltaX, deltaY, formattedCells);
        }

        if (Array.isArray(attributeValue)) {
          return attributeValue.forEach(arrayElement => {
            if (arrayElement instanceof Base) {
              return this.applyDelta(this.resolveCellByModelElement(arrayElement), deltaX, deltaY, formattedCells);
            }
            if (arrayElement?.value instanceof DefaultEntityValue) {
              this.applyDelta(this.resolveCellByModelElement(arrayElement.value), deltaX, deltaY, formattedCells);
            }
            if (arrayElement.property && arrayElement.keys) {
              this.applyDelta(this.resolveCellByModelElement(arrayElement.property), deltaX, deltaY, formattedCells);
            }
            return null;
          });
        }
      });
    edgesToRedraw.forEach(edge => {
      this.graph.resetEdge(edge);
    });
  }
}
