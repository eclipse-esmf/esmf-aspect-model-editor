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

import {LoadedFilesService} from '@ame/cache';
import {computed, inject, Injectable, signal} from '@angular/core';
import {DefaultConstraint, DefaultTrait} from '@esmf/aspect-model-loader';
import {Cell, InternalEvent} from '@maxgraph/core';
import {MaxGraphAttributeService} from '.';
import {MaxGraphHelper} from '../helpers';

@Injectable({providedIn: 'root'})
export class MaxGraphShapeSelectorService {
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly loadedFiles = inject(LoadedFilesService);

  private selectedCellsSignal = signal<Cell[]>([]);

  readonly selectedCells = this.selectedCellsSignal.asReadonly();
  readonly selectedShape = computed<Cell | null>(() => {
    const selected = this.selectedCellsSignal();
    const selectedCell = selected?.[0];
    return selectedCell ? (selectedCell.isEdge() ? null : selectedCell) : null;
  });

  public initSelectionListener(): void {
    this.maxgraphAttributeService.graph.getSelectionModel().addListener(InternalEvent.CHANGE, () => {
      this.selectedCellsSignal.set(this.getSelectedCells());
    });
  }

  /**
   * @returns array of selected cells
   */
  public getSelectedCells(): Array<Cell> {
    const tempCurrentSelection = []; // used to keep track of already selected cells to prevent infinite loop
    // only return the parent elements in case of child cells
    const selectedElementCells: Array<Cell> = [];
    this.maxgraphAttributeService.graph.selectionModel.cells.forEach((cell: Cell) => {
      if (cell.style?.fillColor?.includes('_property')) {
        const parentCell: Cell = cell.getParent();
        if (!selectedElementCells.includes(parentCell)) {
          selectedElementCells.push(parentCell);
          tempCurrentSelection.push(parentCell);
        }
      } else if (!selectedElementCells.includes(cell)) {
        selectedElementCells.push(cell);
        tempCurrentSelection.push(cell);
      }
    });
    // external references will cascade to the upper external references
    let withExternalSelectedElementCells = [];
    selectedElementCells.forEach((cell: Cell) => {
      withExternalSelectedElementCells.push(cell);
      const modelElement = MaxGraphHelper.getModelElement(cell);
      if (!modelElement) {
        return;
      }
      if (this.loadedFiles.isElementExtern(modelElement)) {
        withExternalSelectedElementCells = [
          ...withExternalSelectedElementCells,
          ...this.getExternalUpperReferenceCells(cell, tempCurrentSelection),
        ];
      }
    });
    // remove duplicates
    return [...new Set(withExternalSelectedElementCells)];
  }

  public getSelectedShape(): Cell | null {
    return this.selectedShape();
  }

  /**
   *
   * @returns aspect cell for current instance
   */
  public getAspectCell(): Cell {
    return this.maxgraphAttributeService.graph.getDefaultParent().getChildCount() > 0
      ? this.maxgraphAttributeService.graph.getDefaultParent().children[0]
      : null;
  }

  /**
   * Selects the cluster from which the selected cell is part of
   */
  public selectTree() {
    const graph = this.maxgraphAttributeService.graph;
    const selectedCell = graph.getSelectionCell();
    const cellsToSelect = [];
    const stack = [selectedCell];

    while (stack.length) {
      const cell = stack.pop();
      if (!cellsToSelect.includes(cell)) {
        cellsToSelect.push(cell);
      }

      cell.edges?.forEach(edge => {
        if (!cellsToSelect.includes(edge.target)) {
          cellsToSelect.push(edge.target);
          stack.push(edge.target);
        }

        if (!cellsToSelect.includes(edge.source)) {
          cellsToSelect.push(edge.source);
          stack.push(edge.source);
        }
      });
    }
    graph.selectCellsForEvent(cellsToSelect, null);
  }

  private getExternalUpperReferenceCells(cell: Cell, currentSelection: Cell[]): Cell[] {
    let upperCells = [];
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    incomingEdges.forEach((edge: Cell) => {
      const source = edge.source;
      const sourceModelElement = MaxGraphHelper.getModelElement(source);
      if (this.loadedFiles.isElementExtern(sourceModelElement) && !currentSelection.includes(source)) {
        upperCells.push(source);
        currentSelection.push(source);
        upperCells = [...upperCells, ...this.getExternalUpperReferenceCells(source, currentSelection)];
      }
    });
    if (MaxGraphHelper.getModelElement(cell) instanceof DefaultTrait) {
      const outgoingEdges = this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null);
      outgoingEdges.forEach((edge: Cell) => {
        const target = edge.target;
        const targetModelElement = MaxGraphHelper.getModelElement(target);
        if (this.loadedFiles.isElementExtern(targetModelElement) && targetModelElement instanceof DefaultConstraint) {
          upperCells.push(target);
          currentSelection.push(cell);
        }
      });
    }
    return upperCells;
  }
}
