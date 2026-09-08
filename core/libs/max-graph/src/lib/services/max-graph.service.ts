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

import {CacheUtils, LoadedFilesService} from '@ame/cache';
import {FILTER_ATTRIBUTES, ModelTree} from '@ame/loader-filters';
import {ConfigurationService} from '@ame/settings-dialog';
import {NotificationsService, overlayGeometry} from '@ame/shared';
import {computed, inject, Injectable, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {DefaultCharacteristic, DefaultEntityInstance, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {Cell, CellStyle, Graph, InternalEvent} from '@maxgraph/core';
import {environment} from 'environments/environment';
import {Observable, Subject} from 'rxjs';
import {MaxGraphGeometryProviderService, MaxGraphSetupService} from '.';
import {MaxGraphCharacteristicHelper, MaxGraphHelper} from '../helpers';
import {EdgeStyles, ShapeConfiguration} from '../models';
import {ThemeService} from '../themes/theme.service';
import {MaxGraphAttributeService} from './max-graph-attribute.service';
import {MaxGraphShapeOverlayService} from './max-graph-shape-overlay.service';
import {MaxGraphShapeSelectorService} from './max-graph-shape-selector.service';

export interface Coordinates {
  x: number;
  y: number;
}

@Injectable({providedIn: 'root'})
export class MaxGraphService {
  private readonly filterAttributes = inject(FILTER_ATTRIBUTES);
  private readonly loadedFiles = inject(LoadedFilesService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly graphSetupService = inject(MaxGraphSetupService);
  private readonly maxgraphGeometryProviderService = inject(MaxGraphGeometryProviderService);
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly themeService = inject(ThemeService);
  public readonly maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);

  private nextCellCoordinates: {x: number; y: number} = null;

  public readonly firstTimeFold = signal(true);
  public graph: Graph;
  private readonly _scrollPosition = signal<Coordinates>({
    x: 0,
    y: 0,
  });
  public readonly scrollPosition = this._scrollPosition.asReadonly();

  private readonly _isGraphInitialized = signal(false);
  public readonly isGraphInitialized = this._isGraphInitialized.asReadonly();
  public readonly graphInitialized$ = toObservable(this._isGraphInitialized);

  private readonly cellsCountSignal = signal(0);
  public readonly cellsCount = this.cellsCountSignal.asReadonly();
  public readonly isModelEmpty = computed(() => this.cellsCountSignal() === 0);

  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  constructor() {
    if (!environment.production) {
      window['angular.maxgraphService'] = this;
    }
  }

  initGraph(): void {
    this.graphSetupService.setUp();
    this.graph = this.maxgraphAttributeService.graph;
    this.graph.keepEdgesInBackground = true;
    this.themeService.setGraph(this.graph);
    this._isGraphInitialized.set(true);

    this.initCellsCountListener();
    this.maxgraphShapeSelectorService.initSelectionListener();

    Cell.prototype.clone = function () {
      return this;
    };
  }

  private initCellsCountListener(): void {
    const updateCount = () => this.cellsCountSignal.set(this.getAllCells()?.length ?? 0);
    updateCount();
    this.graph.addListener(InternalEvent.CELLS_ADDED, updateCount);
    this.graph.addListener(InternalEvent.CELLS_REMOVED, updateCount);
  }

  setCoordinatesForNextCellRender(x: number, y: number) {
    this.nextCellCoordinates = {x, y};
  }

  /**
   * Sets the scroll position
   *
   * @param event scroll event object
   */
  setScrollPosition(event: Event): void {
    const {scrollLeft, scrollTop} = event.target as HTMLElement;
    this._scrollPosition.set({
      x: scrollLeft,
      y: scrollTop,
    });
  }

  /**
   * Method to update the graph.Increments the updateLevel by one.
   * The event notification is queued until updateLevel reaches 0 by use of endUpdate.
   * All changes on maxgraphModel are transactional, that is, they are executed in a single un-doable change on the model
   * (without transaction isolation).  Therefore, if you want to combine any number of changes into a single un-doable change,
   * you should group any two or more API calls that modify the graph model between beginUpdate and endUpdate
   */
  updateGraph(updateFunction: () => void): Observable<boolean> {
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
   * @param cell most basic entity of a maxgraph model,
   * @returns array of parent cells
   */
  resolveParents(cell: Cell): Array<Cell> {
    return this.graph.getIncomingEdges(cell, null).map(parent => parent.source);
  }

  /**
   * Gets the cell for a specific model element
   *
   * @param metaModelElement
   * @returns the cell that you want to resolve
   */
  resolveCellByModelElement(metaModelElement: NamedElement): Cell {
    if (metaModelElement instanceof DefaultCharacteristic && metaModelElement.isPredefined) {
      return null;
    }

    return this.graph.getChildVertices(this.graph.getDefaultParent()).find(cell => {
      const metaModel = MaxGraphHelper.getModelElement(cell);
      return metaModel && metaModelElement && metaModel?.aspectModelUrn === metaModelElement?.aspectModelUrn;
    });
  }

  /**
   * Modifies certain model Element with a new cell configuration.
   *
   * @param {ModelTree<NamedElement>} node - The node representing the model element to render.
   * @param {ShapeConfiguration} [configuration] - Optional configuration to customize shape rendering.
   *
   * @returns {Cell} - The rendered shape cell in the graph.
   *
   * @throws {Error} - If there are issues in shape creation or overlay operations.
   */
  renderModelElement(node: ModelTree<NamedElement>, configuration?: ShapeConfiguration): Cell {
    const rawX = (configuration && configuration?.geometry?.x) ?? this.nextCellCoordinates?.x ?? 0;
    const rawY = (configuration && configuration?.geometry?.y) ?? this.nextCellCoordinates?.y ?? 0;

    let posX = rawX;
    let posY = rawY;

    if (this.graph) {
      const initialGeo = this.maxgraphGeometryProviderService.createGeometry(node, rawX, rawY);
      const available = MaxGraphHelper.findAvailablePosition(this.graph, rawX, rawY, initialGeo.width, initialGeo.height);
      posX = available.x;
      posY = available.y;
    }

    const geometry = this.maxgraphGeometryProviderService.createGeometry(node, posX, posY);

    this.nextCellCoordinates = null;
    const cellStyle = this.themeService.generateThemeStyle(node.shape?.maxgraphStyle?.baseStyleNames[0] || '');

    if (this.loadedFiles.isElementExtern(node.element)) {
      cellStyle.fillOpacity = 80;
    }

    if (node.element?.isAnonymous?.()) {
      cellStyle.dashed = true;
      cellStyle.dashPattern = '4 4';
    }

    node.shape.maxgraphStyle = cellStyle;
    const modelShape = this.maxgraphShapeOverlayService.createShape(node, geometry, configuration?.shapeAttributes || []);
    MaxGraphHelper.setElementNode(modelShape, node);

    this.maxgraphShapeOverlayService.checkComplexEnumerationOverlays(node.element, modelShape);

    if (this.loadedFiles.isElementInCurrentFile(node.element)) {
      this.maxgraphShapeOverlayService.addBottomShapeOverlay(modelShape);
      this.maxgraphShapeOverlayService.addTopShapeOverlay(modelShape);
    }
    this.graph.labelChanged(modelShape, MaxGraphHelper.createPropertiesLabel(modelShape), null);

    if (this.maxgraphAttributeService.inCollapsedMode) {
      this.foldCell(modelShape);
    }

    return modelShape;
  }

  /**
   * Update all enumerations, parent entity values where deleted entityValue is linked.
   * Delete all child entity values
   *
   * @param selectedModelElement - EntityValue meta model which will be deleted
   */
  public updateEnumerationsWithEntityValue(selectedModelElement: DefaultEntityInstance): void {
    if (this.loadedFiles.isElementExtern(selectedModelElement)) {
      return;
    }

    selectedModelElement.parents.forEach(enumeration => {
      if (!(enumeration instanceof DefaultEnumeration)) {
        return;
      }
      const entityValueIndex = enumeration.values.indexOf(selectedModelElement);
      if (entityValueIndex >= 0) {
        enumeration.values.splice(entityValueIndex, 1);
      }
    });

    // update all parent entity values
    const allEntityValues: DefaultEntityInstance[] = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance);

    allEntityValues.forEach(entityValue => {
      entityValue.getTuples().forEach(([propertyUrn, value]) => {
        if (value instanceof DefaultEntityInstance && value.aspectModelUrn === selectedModelElement.aspectModelUrn) {
          entityValue.removeAssertion(propertyUrn, value);
        }
      });
    });

    this.currentCachedFile.removeElement(selectedModelElement.aspectModelUrn);
    // delete all lower entity values that don't belong to an enumeration
    const lowerEntityValuesToDelete = MaxGraphCharacteristicHelper.getChildEntityValuesToDelete(
      selectedModelElement,
      allEntityValues.filter(ev => ev.parents.some(p => p instanceof DefaultEnumeration)),
    );
    lowerEntityValuesToDelete.forEach(entityValue => {
      this.currentCachedFile.removeElement(entityValue.aspectModelUrn);
      this.removeCells([this.resolveCellByModelElement(entityValue)]);
    });
  }

  getAllEdges(cellId: string): Cell[] {
    return this.graph.model.getCell(cellId)?.edges;
  }

  /**
   * Navigate to a cell based on URN
   *
   * @param aspectModelUrn aspect URN
   * @returns navigated cell
   */
  navigateToCellByUrn(aspectModelUrn: string): Cell {
    const cellToNavigate = Object.values<Cell>(this.graph.model.cells).find((cell: Cell) => {
      const metaElement = MaxGraphHelper.getModelElement(cell);
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
   * @param cell maxgraph element
   * @param center flag to signal if the cell should be visible on the center
   * @returns navigated cell
   */
  navigateToCell(cell: Cell, center: boolean): Cell {
    if (!cell) {
      this.notificationsService.error({title: 'The element you are looking for was not found'});
      return null;
    }

    this.graph.setSelectionCell(cell);
    this.graph.scrollCellToVisible(cell, center);

    return cell;
  }

  /** Removes all elements of the current aspect  */
  deleteAllShapes(): void {
    this.updateGraph(() => this.graph.removeCells(this.graph.getChildCells(this.graph.getDefaultParent())));
  }

  /** Expand all cells*/
  expandCells() {
    const cells = this.graph.getChildCells(this.graph.getDefaultParent(), true, false);
    this.graph.foldCells(false, true, cells);
    this.maxgraphAttributeService.inCollapsedMode = false;

    return this.updateGraph(() => {
      for (const cell of cells) {
        this.graph.resizeCell(
          cell,
          this.maxgraphGeometryProviderService.createGeometry(MaxGraphHelper.getElementNode(cell), cell?.geometry?.x, cell?.geometry?.y),
        );
        const modelElement = MaxGraphHelper.getModelElement(cell);
        if (MaxGraphHelper.isComplexEnumeration(modelElement)) {
          this.maxgraphShapeOverlayService.addComplexEnumerationShapeOverlay(cell);
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = overlayGeometry.expandedWith;
          overlay.image.height = overlayGeometry.expandedHeight;

          MaxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });
      }

      const selectedCell = this.maxgraphShapeSelectorService.getSelectedShape();
      if (selectedCell) {
        this.navigateToCell(selectedCell, true);
      }

      if (this.firstTimeFold()) {
        this.firstTimeFold.set(false);
        this.formatShapes(true);
        this.graph.refresh();
      }
    });
  }

  /** Collapse all cells */
  foldCells() {
    const cells = this.graph.getChildCells(this.graph.getDefaultParent(), true, false);
    this.graph.foldCells(true, true, cells);
    this.maxgraphAttributeService.inCollapsedMode = true;

    return this.updateGraph(() => {
      for (const cell of cells) {
        const modelElement = MaxGraphHelper.getModelElement(cell);
        if (MaxGraphHelper.isComplexEnumeration(modelElement)) {
          this.maxgraphShapeOverlayService.removeOverlay(cell, MaxGraphHelper.getRightOverlayButton(cell));
        }

        cell.overlays?.forEach(overlay => {
          overlay.image.width = overlayGeometry.collapsedWidth;
          overlay.image.height = overlayGeometry.collapsedHeight;

          MaxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });

        const geometry = cell.getGeometry();
        const isVertex = cell.isVertex();
        this.maxgraphGeometryProviderService.upgradeTraitGeometry(cell, geometry, isVertex);
        this.maxgraphGeometryProviderService.upgradeEntityValueGeometry(cell, geometry, isVertex);
      }

      const selectedCell = this.maxgraphShapeSelectorService.getSelectedShape();
      if (selectedCell) {
        this.navigateToCell(selectedCell, true);
      }
      if (this.firstTimeFold()) {
        this.formatShapes(true);
        this.firstTimeFold.set(false);
        this.graph.refresh();
      }
    });
  }

  /**
   * Expand a targeted cell
   *
   * @param cell maxgraph element
   */
  expandCell(cell: Cell): void {
    this.graph.foldCells(false, false, [cell]);
    cell.overlays?.forEach(overlay => {
      overlay.image.width = overlayGeometry.expandedWith;
      overlay.image.height = overlayGeometry.expandedHeight;

      MaxGraphHelper.setConstrainOverlayOffset(overlay, cell);
    });
  }

  /**
   * Collapse a targeted cell
   *
   * @param cell maxgraph element
   */
  foldCell(cell: Cell): void {
    this.graph.foldCells(true, false, [cell]);
    cell.overlays?.forEach(overlay => {
      overlay.image.width = overlayGeometry.collapsedWidth;
      overlay.image.height = overlayGeometry.collapsedHeight;

      MaxGraphHelper.setConstrainOverlayOffset(overlay, cell);
    });
    this.graph.refresh();
  }

  /**
   * Re-formats the entire graph
   *
   * @param force controls whether to ignore "autoFormatEnabled" settings or not
   * @param restoreScrollPosition allows to restore a scroll position to keep the same elements visible after formatting
   */
  formatShapes(force = false, restoreScrollPosition = false): void {
    if (!this.configurationService.getSettings().autoFormatEnabled && !force) return;
    if (this.graph.getDefaultParent().children === undefined) return;

    const selectedShape = restoreScrollPosition ? this.maxgraphShapeSelectorService.getSelectedShape() : undefined;
    const visibleCell = restoreScrollPosition ? this.getVisibleCells()[0] : undefined;
    const visibleCellCoordinates = restoreScrollPosition ? this.getCellCoordinates(visibleCell, this.graph) : undefined;

    if (this.configurationService.getSettings().enableHierarchicalLayout) {
      MaxGraphHelper.setHierarchicalLayout(this.graph, this.maxgraphAttributeService.inCollapsedMode);
    } else {
      MaxGraphHelper.setCompactTreeLayout(this.graph, this.maxgraphAttributeService.inCollapsedMode);
    }

    if (!restoreScrollPosition) return;

    if (selectedShape) {
      this.navigateToCell(selectedShape, true);
    } else if (visibleCell) {
      const newCellCoordinates = this.getCellCoordinates(visibleCell, this.graph);
      if (visibleCellCoordinates.x === newCellCoordinates.x && visibleCellCoordinates.y === newCellCoordinates.y) return;

      this.graph.scrollCellToVisible(visibleCell, true);
    }
  }

  formatCell(cell: Cell, force = false) {
    if (!force && this.configurationService.getSettings().autoFormatEnabled) {
      // don't apply cell formatting in case auto format is enabled
      return;
    }
    const initialX = cell.geometry.x;
    const initialY = cell.geometry.y;
    const formattedCells = [];
    if (this.graph.getDefaultParent().children !== undefined) {
      if (this.configurationService.getSettings().enableHierarchicalLayout) {
        MaxGraphHelper.setHierarchicalLayout(this.graph, this.maxgraphAttributeService.inCollapsedMode, cell);
      } else {
        MaxGraphHelper.setCompactTreeLayout(this.graph, this.maxgraphAttributeService.inCollapsedMode, cell);
      }
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
   * @param child child maxgraph element
   * @param parent parent maxgraph element
   */
  assignToParent(child: Cell, parent?: Cell, edgeStyle?: string): void {
    if (!parent) {
      return;
    }

    const childNode = MaxGraphHelper.getElementNode(child);

    if (
      (parent?.edges || []).some(edge => MaxGraphHelper.getModelElement(edge.target)?.aspectModelUrn === childNode.element.aspectModelUrn)
    ) {
      return;
    }

    this.graph.insertEdge(this.graph.getDefaultParent(), null, null, parent, child, {
      baseStyleNames: [edgeStyle || childNode?.fromParentArrow || EdgeStyles.defaultEdge],
      strokeColor: this.themeService.currentColors.border,
      fontColor: this.themeService.currentColors.font,
    } as CellStyle);

    if (!this.filterAttributes.isFiltering) {
      MaxGraphHelper.establishRelation(MaxGraphHelper.getModelElement(parent), childNode.element);
    }
  }

  /**
   * Show validation error on a cell based on an URN string
   *
   * @param focusNodeUrn focused node URN
   */
  showValidationErrorOnShape(focusNodeUrn: string): void {
    Object.values<Cell>(this.graph.model.cells).forEach((cell: Cell) => {
      const modelElement = MaxGraphHelper.getModelElement(cell);
      if (modelElement && modelElement.aspectModelUrn === focusNodeUrn) {
        this.graph.setCellStyles('strokeColor', 'red', [cell]);
        this.graph.setCellStyles('strokeWidth', 3, [cell]);
      }
    });
  }

  /** Resets entire validation */
  resetValidationErrorOnAllShapes(): void {
    this.updateGraph(() => {
      Object.values<Cell>(this.graph.model.cells).forEach((cell: Cell) => {
        if (!cell.isEdge()) {
          this.graph.setCellStyles('strokeColor', this.themeService.currentColors.border, [cell]);
          this.graph.setCellStyles('strokeWidth', 2, [cell]);
        }
      });
    });
  }

  removeCells(cells: Array<Cell>, includeEdges = true): void {
    if (!cells || cells.length === 0) return;

    const allCellsToRemove: Cell[] = [];
    for (const cell of cells) {
      if (!cell) continue;
      if (!allCellsToRemove.includes(cell)) {
        allCellsToRemove.push(cell);
      }
      if (includeEdges && !cell.isEdge?.()) {
        const incoming = this.graph?.getIncomingEdges?.(cell, null) || [];
        const outgoing = this.graph?.getOutgoingEdges?.(cell, null) || [];
        const cellEdges = cell?.edges || [];
        for (const edge of [...incoming, ...outgoing, ...cellEdges]) {
          if (edge && !allCellsToRemove.includes(edge)) {
            allCellsToRemove.push(edge);
          }
        }
      }
    }

    for (const cell of cells) {
      if (cell?.isEdge?.()) {
        if (cell.source && cell.target) {
          const parent = MaxGraphHelper.getModelElement(cell.source);
          const child = MaxGraphHelper.getModelElement(cell.target);
          if (parent && child && this.loadedFiles.isElementInCurrentFile(parent)) MaxGraphHelper.removeRelation(parent, child);
        }
        continue;
      }

      const modelElement = MaxGraphHelper.getModelElement(cell);
      if (!modelElement || this.loadedFiles.isElementExtern(modelElement)) continue;

      for (const child of modelElement.children) {
        MaxGraphHelper.removeRelation(modelElement, child);
      }

      for (const parent of modelElement.parents) {
        if (this.loadedFiles.isElementInCurrentFile(parent)) MaxGraphHelper.removeRelation(parent, modelElement);
      }
    }
    this.graph.removeCells(allCellsToRemove, includeEdges);
    this.graph.refresh();
  }

  moveCells(cells: Array<Cell>, dx: number, dy: number): void {
    this.graph.moveCells(cells, dx, dy);
  }

  /**
   *
   * @returns array with all available cells(maxgraph elements)
   */
  getAllCells(): Cell[] {
    return this.graph?.getChildVertices?.(this.graph.getDefaultParent());
  }

  setStrokeColor(color: string, shapesToHighlight: Cell[]) {
    this.graph.setCellStyles('strokeColor', color, shapesToHighlight);
  }

  /**
   * This method will search in cache for all entryValues, find the ones with properties = deleted entity value and clear these properties.
   *
   * @param deletedEntityValue - EntityValueProperty.value that needs to be cleared.
   */
  public updateEntityValuesWithReference(deletedEntityValue: DefaultEntityInstance): void {
    if (this.loadedFiles.isElementExtern(deletedEntityValue)) {
      return;
    }

    CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntityInstance).forEach(entityValue =>
      entityValue.getTuples().forEach(([propertyUrn, value]) => {
        if (value instanceof DefaultEntityInstance && value.aspectModelUrn === deletedEntityValue.aspectModelUrn) {
          entityValue.removeAssertion(propertyUrn, value);
        }
      }),
    );
  }

  /**
   * This method will transform cell to modelElement and update all the references where deletedEntityValueCells ar present.
   *
   * @param deletedEntityValueCells - cell which needs to be cleaned
   */
  public updateEntityValuesWithCellReference(deletedEntityValueCells: Array<Cell>): void {
    deletedEntityValueCells
      .filter(entityValueCell => entityValueCell.isVertex())
      .forEach(entityValueCell =>
        this.updateEntityValuesWithReference(MaxGraphHelper.getModelElement<DefaultEntityInstance>(entityValueCell)),
      );
  }

  private applyDelta(cell: Cell, deltaX: number, deltaY: number, formattedCells: Cell[]) {
    if (!cell || formattedCells.includes(cell)) {
      return;
    }

    formattedCells.push(cell);
    cell.geometry.x += deltaX;
    cell.geometry.y += deltaY;

    const edgesToRedraw = this.graph.getOutgoingEdges(cell, null);
    for (const edge of edgesToRedraw) {
      this.applyDelta(edge.target, deltaX, deltaY, formattedCells);
      this.graph.resetEdge(edge);
    }
  }

  /**
   * Get an array of cells which are currently visible to a user
   */
  public getVisibleCells(): Cell[] {
    const graph = this.maxgraphAttributeService.graph;
    const cells: Record<any, Cell> = graph.model.cells;
    const visibleCells: Cell[] = [];

    Object.values(cells).forEach(cell => {
      const isCellVisible = this.isCellVisible(cell, graph, this.scrollPosition());

      if (isCellVisible) {
        visibleCells.push(cell);
      }
    });

    return visibleCells;
  }

  /**
   * Determines whether a cell is currently visible to a user or not.
   *
   * @param cell a cell to examine
   * @param graph a graph the cell belongs to
   * @param scrollPosition current position of the scroll, relative to the graph container
   */
  public isCellVisible(cell: Cell, graph: Graph, scrollPosition: Coordinates): boolean {
    if (cell.edge) return false;

    const viewportWidth = graph.container.clientWidth;
    const viewportHeight = graph.container.clientHeight;

    const xRangeStart = scrollPosition.x;
    const xRangeEnd = viewportWidth + xRangeStart;
    const yRangeStart = scrollPosition.y;
    const yRangeEnd = viewportHeight + yRangeStart;
    const coordinates = this.getCellCoordinates(cell, graph);

    if (!coordinates) return false;

    return coordinates.x >= xRangeStart && coordinates.x <= xRangeEnd && coordinates.y >= yRangeStart && coordinates.y <= yRangeEnd;
  }

  /**
   * Get cell coordinates from DOM element directly
   *
   * @param cell target cell
   * @param graph a graph the cell belongs to
   */
  public getCellCoordinates(cell: Cell, graph: Graph): Coordinates {
    const cellState = graph.view.getState(cell);
    const cellNode = cellState?.shape?.node;

    if (!cellNode) return undefined;

    const childNode = cellNode.firstChild as HTMLElement;
    const x = +childNode.getAttribute('x');
    const y = +childNode.getAttribute('y');

    return {x, y};
  }
}
