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

import {Inject, Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {Observable, Subject} from 'rxjs';
import {MxGraphShapeOverlayService} from './mx-graph-shape-overlay.service';
import {MxGraphAttributeService} from './mx-graph-attribute.service';
import {MxGraphShapeSelectorService} from './mx-graph-shape-selector.service';
import {environment} from 'environments/environment';
import {MxGraphGeometryProviderService, MxGraphSetupService} from '.';
import {MxGraphCharacteristicHelper, MxGraphHelper} from '../helpers';
import {mxCell, mxConstants, mxUtils} from '../providers';
import {BaseMetaModelElement, DefaultCharacteristic, DefaultEntityValue} from '@ame/meta-model';
import {ConfigurationService} from '@ame/settings-dialog';
import {overlayGeometry, NotificationsService} from '@ame/shared';
import {NamespacesCacheService} from '@ame/cache';
import {ThemeService} from '../themes/theme.service';
import {ShapeConfiguration} from '../models';
import {FILTER_ATTRIBUTES, FilterAttributesService, ModelTree} from '@ame/loader-filters';

@Injectable()
export class MxGraphService {
  private document: Document;
  private nextCellCoordinates: {x: number; y: number} = null;

  public firstTimeFold = true;
  public graph: mxgraph.mxGraph;

  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(
    @Inject(FILTER_ATTRIBUTES) private filterAttributes: FilterAttributesService,
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

  setCoordinatesForNextCellRender(x: number, y: number) {
    this.nextCellCoordinates = {x, y};
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
    this.graph.model.beginUpdate();
    try {
      updateFunction?.();
    } finally {
      requestAnimationFrame(() => {
        this.graph.model.endUpdate();
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
    return this.graph.getIncomingEdges(cell).map(parent => parent.source);
  }

  /**
   * Gets the cell for a specific model element
   *
   * @param metaModelElement
   * @returns the cell that you want to resolve
   */
  resolveCellByModelElement(metaModelElement: BaseMetaModelElement): mxgraph.mxCell {
    if (metaModelElement instanceof DefaultCharacteristic && metaModelElement.isPredefined()) {
      return null;
    }

    return this.graph.getChildVertices(this.graph.getDefaultParent()).find(cell => {
      const metaModel = MxGraphHelper.getModelElement(cell);
      return metaModel?.aspectModelUrn === metaModelElement.aspectModelUrn;
    });
  }

  /**
   * Modifies certain model Element with a new cell configuration.
   *
   * @param {ModelTree<BaseMetaModelElement>} node - The node representing the model element to render.
   * @param {ShapeConfiguration} [configuration] - Optional configuration to customize shape rendering.
   *
   * @returns {mxgraph.mxCell} - The rendered shape cell in the graph.
   *
   * @throws {Error} - If there are issues in shape creation or overlay operations.
   */
  renderModelElement(node: ModelTree<BaseMetaModelElement>, configuration?: ShapeConfiguration): mxgraph.mxCell {
    const geometry = this.mxGraphGeometryProviderService.createGeometry(
      node,
      (configuration && configuration.geometry.x) || this.nextCellCoordinates?.x || 0,
      (configuration && configuration.geometry.y) || this.nextCellCoordinates?.y || 0
    );

    this.nextCellCoordinates = null;
    let cellStyle = node.shape.mxGraphStyle || '';

    cellStyle = this.themeService.generateThemeStyle(cellStyle);
    if (node.element.isExternalReference()) {
      cellStyle = mxUtils.setStyle(cellStyle, mxConstants.STYLE_FILL_OPACITY, 80);
    }

    node.shape.mxGraphStyle = cellStyle;
    const modelShape = this.mxGraphShapeOverlayService.createShape(node, geometry, configuration?.shapeAttributes || []);
    MxGraphHelper.setElementNode(modelShape, node);

    this.mxGraphShapeOverlayService.checkComplexEnumerationOverlays(node.element, modelShape);

    if (!node.element.isExternalReference()) {
      this.mxGraphShapeOverlayService.addBottomShapeOverlay(modelShape);
      this.mxGraphShapeOverlayService.addTopShapeOverlay(modelShape);
    }
    this.graph.labelChanged(modelShape, MxGraphHelper.createPropertiesLabel(modelShape));
    this.mxGraphAttributeService.inCollapsedMode && this.foldCell(modelShape);
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

    this.currentCachedFile.removeElement(selectedModelElement.aspectModelUrn);
    // delete all lower entity values that don't belong to an enumeration
    const lowerEntityValuesToDelete = MxGraphCharacteristicHelper.getChildEntityValuesToDelete(selectedModelElement, []);
    lowerEntityValuesToDelete.forEach(entityValue => {
      this.currentCachedFile.removeElement(entityValue.aspectModelUrn);
      this.removeCells([this.resolveCellByModelElement(entityValue)]);
    });
  }

  getAllEdges(cellId: string): mxgraph.mxCell[] {
    return this.graph.model.getCell(cellId)?.edges;
  }

  /**
   * Navigate to a cell based on URN
   *
   * @param aspectModelUrn aspect URN
   * @returns navigated cell
   */
  navigateToCellByUrn(aspectModelUrn: string): mxgraph.mxCell {
    const cellToNavigate = Object.values<mxgraph.mxCell>(this.graph.model.cells).find((cell: mxgraph.mxCell) => {
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
      this.notificationsService.error({title: 'The element you are looking for was not found'});
      return null;
    }

    this.graph.selectCellForEvent(cell);
    this.graph.scrollCellToVisible(cell, center);

    return cell;
  }

  /** Removes all elements of the current aspect  */
  deleteAllShapes(): void {
    this.updateGraph(() => this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent())));
  }

  /** Expand all cells*/
  expandCells() {
    const cells = this.graph.getChildCells(this.graph.getDefaultParent(), true, false);
    this.graph.foldCells(false, true, cells);
    this.mxGraphAttributeService.inCollapsedMode = false;

    return this.updateGraph(() => {
      for (const cell of cells) {
        this.graph.resizeCell(
          cell,
          this.mxGraphGeometryProviderService.createGeometry(MxGraphHelper.getElementNode(cell), cell?.geometry?.x, cell?.geometry?.y)
        );
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (MxGraphHelper.isComplexEnumeration(modelElement)) {
          this.mxGraphShapeOverlayService.addComplexEnumerationShapeOverlay(cell);
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = overlayGeometry.expandedWith;
          overlay.image.height = overlayGeometry.expandedHeight;

          MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });
      }

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
    const cells = this.graph.getChildCells(this.graph.getDefaultParent(), true, false);
    this.graph.foldCells(true, true, cells);
    this.mxGraphAttributeService.inCollapsedMode = true;

    return this.updateGraph(() => {
      for (const cell of cells) {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (MxGraphHelper.isComplexEnumeration(modelElement)) {
          this.mxGraphShapeOverlayService.removeOverlay(cell, MxGraphHelper.getRightOverlayButton(cell));
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = overlayGeometry.collapsedWidth;
          overlay.image.height = overlayGeometry.collapsedHeight;

          MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });

        const geometry = this.graph.model.getGeometry(cell);
        const isVertex = this.graph.model.isVertex(cell);
        this.mxGraphGeometryProviderService.upgradeTraitGeometry(cell, geometry, isVertex);
        this.mxGraphGeometryProviderService.upgradeEntityValueGeometry(cell, geometry, isVertex);
      }

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
    this.graph.foldCells(false, false, [cell]);
    cell.overlays?.forEach(overlay => {
      overlay.image.width = overlayGeometry.expandedWith;
      overlay.image.height = overlayGeometry.expandedHeight;

      MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
    });
  }

  /**
   * Collapse a targeted cell
   *
   * @param cell mx element
   */
  foldCell(cell: mxgraph.mxCell): void {
    this.graph.foldCells(true, false, [cell]);
    cell.overlays?.forEach(overlay => {
      overlay.image.width = overlayGeometry.collapsedWidth;
      overlay.image.height = overlayGeometry.collapsedHeight;

      MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
    });
    this.graph.refresh();
  }

  /** Re-formats entire schematic. */
  formatShapes(force = false): void {
    if (!this.configurationService.getSettings().autoFormatEnabled && !force) {
      return;
    }

    if (this.graph.getDefaultParent().children !== undefined) {
      this.configurationService.getSettings().enableHierarchicalLayout
        ? MxGraphHelper.setHierarchicalLayout(this.graph, this.mxGraphAttributeService.inCollapsedMode)
        : MxGraphHelper.setCompactTreeLayout(this.graph, this.mxGraphAttributeService.inCollapsedMode);
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
    if (this.graph.getDefaultParent().children !== undefined) {
      this.configurationService.getSettings().enableHierarchicalLayout
        ? MxGraphHelper.setHierarchicalLayout(this.graph, this.mxGraphAttributeService.inCollapsedMode, cell)
        : MxGraphHelper.setCompactTreeLayout(this.graph, this.mxGraphAttributeService.inCollapsedMode, cell);
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
  assignToParent(child: mxgraph.mxCell, parent?: mxgraph.mxCell, edgeStyle?: string): void {
    if (!parent) {
      return;
    }

    const childNode = MxGraphHelper.getElementNode(child);

    if (
      (parent?.edges || []).some(edge => MxGraphHelper.getModelElement(edge.target).aspectModelUrn === childNode.element.aspectModelUrn)
    ) {
      return;
    }

    this.graph.insertEdge(this.graph.getDefaultParent(), null, null, parent, child, edgeStyle || childNode.fromParentArrow);

    if (!this.filterAttributes.isFiltering) {
      MxGraphHelper.establishRelation(MxGraphHelper.getModelElement(parent), childNode.element);
    }
  }

  /**
   * Show validation error on a cell based on an URN string
   *
   * @param focusNodeUrn focused node URN
   */
  showValidationErrorOnShape(focusNodeUrn: string): void {
    Object.values<mxgraph.mxCell>(this.graph.model.cells).forEach((cell: mxgraph.mxCell) => {
      const modelElement = MxGraphHelper.getModelElement(cell);
      if (modelElement && modelElement.aspectModelUrn === focusNodeUrn) {
        this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'red', [cell]);
        this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 3, [cell]);
      }
    });
  }

  /** Resets entire validation */
  resetValidationErrorOnAllShapes(): void {
    this.updateGraph(() => {
      Object.values<mxgraph.mxCell>(this.graph.model.cells).forEach((cell: mxgraph.mxCell) => {
        if (!cell.isEdge()) {
          this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, this.themeService.currentColors.border, [cell]);
          this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 2, [cell]);
        }
      });
    });
  }

  removeCells(cells: Array<mxgraph.mxCell>, includeEdges = true): void {
    for (const cell of cells) {
      if (cell.isEdge()) {
        if (cell.source && cell.target) {
          const parent = MxGraphHelper.getModelElement(cell.source);
          const child = MxGraphHelper.getModelElement(cell.target);
          if (!parent.isExternalReference()) MxGraphHelper.removeRelation(parent, child);
        }
        continue;
      }

      const modelElement = MxGraphHelper.getModelElement(cell);
      if (modelElement.isExternalReference()) continue;

      for (const child of modelElement.children) {
        MxGraphHelper.removeRelation(modelElement, child);
      }

      for (const parent of modelElement.parents) {
        if (!parent.isExternalReference()) MxGraphHelper.removeRelation(parent, modelElement);
      }
    }
    this.graph.removeCells(cells, includeEdges);
  }

  moveCells(cells: Array<mxgraph.mxCell>, dx: number, dy: number): void {
    this.graph.moveCells(cells, dx, dy);
  }

  /**
   *
   * @returns array with all available cells(mx elements)
   */
  getAllCells(): mxgraph.mxCell[] {
    return this.graph?.getChildVertices?.(this.graph.getDefaultParent());
  }

  setStrokeColor(color: string, shapesToHighlight: mxgraph.mxCell[]) {
    this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, color, shapesToHighlight);
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

    this.currentCachedFile.getCachedEntityValues().forEach(entityValue =>
      entityValue.properties.forEach(entityValueToUpdate => {
        if (
          entityValueToUpdate.value instanceof DefaultEntityValue &&
          entityValueToUpdate.value.aspectModelUrn === deletedEntityValue.aspectModelUrn
        )
          entityValueToUpdate.value = '';
      })
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
      .forEach(entityValueCell => this.updateEntityValuesWithReference(MxGraphHelper.getModelElement<DefaultEntityValue>(entityValueCell)));
  }

  private applyDelta(cell: mxgraph.mxCell, deltaX: number, deltaY: number, formattedCells: mxgraph.mxCell[]) {
    if (!cell || formattedCells.includes(cell)) {
      return;
    }

    formattedCells.push(cell);
    cell.geometry.x += deltaX;
    cell.geometry.y += deltaY;

    const edgesToRedraw = this.graph.getOutgoingEdges(cell);
    for (const edge of edgesToRedraw) {
      this.applyDelta(edge.target, deltaX, deltaY, formattedCells);
      this.graph.resetEdge(edge);
    }
  }
}
